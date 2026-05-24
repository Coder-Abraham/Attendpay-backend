"""
AttendPay – API Views
"""

import json
from datetime import date, timedelta

from django.utils import timezone
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Count, Q

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .models import Employee, Salary, DailyQRCode, AttendanceRecord, MonthlyPayroll
from .serializers import (
    LoginSerializer, RegisterSerializer,
    EmployeeSerializer, EmployeeListSerializer,
    SalarySerializer, SalaryAssignSerializer,
    QRCodeSerializer,
    AttendanceRecordSerializer, ClockInSerializer, ClockOutSerializer,
    MonthlyPayrollSerializer,
    AdminDashboardSerializer, EmployeeDashboardSerializer,
)
from .utils import (
    is_within_company_premises, generate_qr_token,
    calculate_payroll,
    get_today_accumulated, get_week_accumulated, get_month_accumulated,
)
from .qr_manager import get_or_create_daily_qr


# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    POST /api/auth/login/
    Body: { employee_id, password }
    Returns: { token, employee_id, name, role, organization_id, is_approved }
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    employee_id = serializer.validated_data['employee_id'].upper()
    password    = serializer.validated_data['password']

    user = authenticate(request, username=employee_id, password=password)
    if user is None:
        return Response({'error': 'Invalid Employee ID or password.'},
                        status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'error': 'Account is disabled.'},
                        status=status.HTTP_403_FORBIDDEN)

    # Admins can always log in; employees need approval
    if user.role == Employee.EMPLOYEE and not user.is_approved:
        return Response(
            {'error': 'Your account is pending admin approval. Please wait.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response({
        'token':           token.key,
        'employee_id':     user.employee_id,
        'name':            user.name,
        'role':            user.role,
        'organization_id': user.organization_id,
        'is_approved':     user.is_approved,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    POST /api/auth/register/
    Employee self-registration after scanning Registration QR.
    """
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    employee = serializer.save()
    return Response({
        'message':     f'Account created for {employee.name}. Awaiting admin approval.',
        'employee_id': employee.employee_id,
        'name':        employee.name,
        'organization_id': employee.organization_id,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """DELETE the auth token."""
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully.'})


# ─────────────────────────────────────────────────────────────────────────────
# Employee profile
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def employee_profile(request):
    """GET or PATCH the logged-in employee's own profile."""
    if request.method == 'GET':
        serializer = EmployeeSerializer(request.user)
        return Response(serializer.data)

    serializer = EmployeeSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# Admin – Employee management
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_employee_list(request):
    """
    GET /api/admin/employees/
    Returns all employees with attendance stats.
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    employees  = Employee.objects.filter(role=Employee.EMPLOYEE)
    serializer = EmployeeListSerializer(employees, many=True)
    return Response(serializer.data)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def admin_employee_detail(request, employee_id):
    """GET or PATCH a specific employee (admin only)."""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = Employee.objects.get(employee_id=employee_id.upper())
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(EmployeeSerializer(employee).data)

    serializer = EmployeeSerializer(employee, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_approve_employee(request, employee_id):
    """POST /api/admin/employees/<id>/approve/ — approve a pending employee."""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = Employee.objects.get(employee_id=employee_id.upper(), role=Employee.EMPLOYEE)
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

    employee.is_approved = True
    employee.save(update_fields=['is_approved'])
    return Response({'message': f'{employee.name} approved successfully.'})


# ─────────────────────────────────────────────────────────────────────────────
# Admin – Dashboard overview
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    """GET /api/admin/dashboard/"""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    today          = timezone.localdate()
    total_employees = Employee.objects.filter(role=Employee.EMPLOYEE, is_approved=True).count()

    today_records  = AttendanceRecord.objects.filter(date=today)
    present_today  = today_records.filter(status__in=[AttendanceRecord.PRESENT, AttendanceRecord.INCOMPLETE]).count()
    absent_today   = today_records.filter(status=AttendanceRecord.ABSENT).count()

    # Late = clocked in after 09:00 local time
    late_today = 0
    for rec in today_records.filter(clock_in_time__isnull=False):
        local_in = timezone.localtime(rec.clock_in_time)
        if local_in.hour >= 9:
            late_today += 1

    # Average attendance % across all employees (last 30 days)
    thirty_days_ago = today - timedelta(days=30)
    all_records     = AttendanceRecord.objects.filter(date__gte=thirty_days_ago)
    total_r  = all_records.count()
    present_r = all_records.filter(status=AttendanceRecord.PRESENT).count()
    avg_attendance = round((present_r / total_r * 100), 1) if total_r else 0.0

    data = {
        'total_employees':    total_employees,
        'present_today':      present_today,
        'absent_today':       absent_today,
        'late_today':         late_today,
        'average_attendance': avg_attendance,
    }
    return Response(AdminDashboardSerializer(data).data)


# ─────────────────────────────────────────────────────────────────────────────
# Admin – Daily attendance report
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_attendance_report(request):
    """
    GET /api/admin/attendance/?date=YYYY-MM-DD  (defaults to today)
    Returns per-employee records for that day.
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    date_str = request.query_params.get('date')
    try:
        report_date = date.fromisoformat(date_str) if date_str else timezone.localdate()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    records    = AttendanceRecord.objects.filter(date=report_date).select_related('employee')
    serializer = AttendanceRecordSerializer(records, many=True)

    total_employees = Employee.objects.filter(role=Employee.EMPLOYEE, is_approved=True).count()
    present = records.filter(status__in=[AttendanceRecord.PRESENT, AttendanceRecord.INCOMPLETE]).count()
    absent  = records.filter(status=AttendanceRecord.ABSENT).count()
    late    = sum(
        1 for r in records.filter(clock_in_time__isnull=False)
        if timezone.localtime(r.clock_in_time).hour >= 9
    )

    return Response({
        'date':             str(report_date),
        'total_employees':  total_employees,
        'present':          present,
        'absent':           absent,
        'late':             late,
        'records':          serializer.data,
    })


# ─────────────────────────────────────────────────────────────────────────────
# QR Code management
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_qr(request, qr_type):
    """
    GET /api/qr/<qr_type>/   where qr_type ∈ {arrival, departure, registration}
    Admin only. Returns (or creates) today's QR for that type.
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if qr_type not in [DailyQRCode.ARRIVAL, DailyQRCode.DEPARTURE, DailyQRCode.REGISTRATION]:
        return Response({'error': 'Invalid QR type.'}, status=status.HTTP_400_BAD_REQUEST)

    qr = get_or_create_daily_qr(qr_type, request.user.organization_id)
    return Response(QRCodeSerializer(qr).data)


# ─────────────────────────────────────────────────────────────────────────────
# Attendance – Clock In / Clock Out
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_in(request):
    """
    POST /api/attendance/clock-in/
    Body: { qr_token, latitude, longitude }
    """
    serializer = ClockInSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    employee  = request.user
    today     = timezone.localdate()
    now       = timezone.now()
    token     = serializer.validated_data['qr_token']
    latitude  = serializer.validated_data['latitude']
    longitude = serializer.validated_data['longitude']

    # 1. Validate QR token
    try:
        qr = DailyQRCode.objects.get(token=token, qr_type=DailyQRCode.ARRIVAL)
    except DailyQRCode.DoesNotExist:
        return Response({'error': 'Invalid QR code.'}, status=status.HTTP_400_BAD_REQUEST)

    if qr.date != today:
        return Response({'error': 'QR code has expired. Please scan today\'s Arrival QR.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # 2. Location check
    if not is_within_company_premises(latitude, longitude):
        return Response(
            {'error': 'You must be within company premises to clock in.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 3. One clock-in per day
    record, created = AttendanceRecord.objects.get_or_create(
        employee=employee,
        date=today,
        defaults={
            'clock_in_time': now,
            'clock_in_lat':  latitude,
            'clock_in_lng':  longitude,
            'status':        AttendanceRecord.INCOMPLETE,
        },
    )
    if not created and record.clock_in_time is not None:
        return Response({'error': 'You have already clocked in today.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if not created:
        # Record existed (e.g. pre-created as absent) — update it
        record.clock_in_time = now
        record.clock_in_lat  = latitude
        record.clock_in_lng  = longitude
        record.status        = AttendanceRecord.INCOMPLETE
        record.save(update_fields=['clock_in_time', 'clock_in_lat', 'clock_in_lng', 'status'])

    local_time = timezone.localtime(now)
    return Response({
        'message':   'Clocked in successfully.',
        'timestamp': now.isoformat(),
        'time':      local_time.strftime('%I:%M %p'),
        'location':  {'latitude': latitude, 'longitude': longitude},
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clock_out(request):
    """
    POST /api/attendance/clock-out/
    Body: { qr_token, latitude, longitude }
    """
    serializer = ClockOutSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    employee  = request.user
    today     = timezone.localdate()
    now       = timezone.now()
    token     = serializer.validated_data['qr_token']
    latitude  = serializer.validated_data['latitude']
    longitude = serializer.validated_data['longitude']

    # 1. Validate QR token
    try:
        qr = DailyQRCode.objects.get(token=token, qr_type=DailyQRCode.DEPARTURE)
    except DailyQRCode.DoesNotExist:
        return Response({'error': 'Invalid QR code.'}, status=status.HTTP_400_BAD_REQUEST)

    if qr.date != today:
        return Response({'error': 'QR code has expired. Please scan today\'s Departure QR.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # 2. Location check
    if not is_within_company_premises(latitude, longitude):
        return Response(
            {'error': 'You must be within company premises to clock out.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 3. Must have clocked in first
    try:
        record = AttendanceRecord.objects.get(employee=employee, date=today)
    except AttendanceRecord.DoesNotExist:
        return Response({'error': 'You have not clocked in today.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if record.clock_in_time is None:
        return Response({'error': 'You have not clocked in today.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if record.clock_out_time is not None:
        return Response({'error': 'You have already clocked out today.'},
                        status=status.HTTP_400_BAD_REQUEST)

    record.clock_out_time = now
    record.clock_out_lat  = latitude
    record.clock_out_lng  = longitude
    record.status         = AttendanceRecord.PRESENT
    record.save(update_fields=['clock_out_time', 'clock_out_lat', 'clock_out_lng', 'status'])

    local_time = timezone.localtime(now)
    return Response({
        'message':      'Clocked out successfully.',
        'timestamp':    now.isoformat(),
        'time':         local_time.strftime('%I:%M %p'),
        'hours_worked': record.hours_worked,
        'location':     {'latitude': latitude, 'longitude': longitude},
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_attendance_history(request):
    """
    GET /api/attendance/history/?employee_id=EMP001
    Employee sees own history; admin can query any employee.
    """
    employee_id = request.query_params.get('employee_id')

    if employee_id and request.user.is_admin:
        try:
            employee = Employee.objects.get(employee_id=employee_id.upper())
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        employee = request.user

    records    = AttendanceRecord.objects.filter(employee=employee).order_by('-date')[:60]
    serializer = AttendanceRecordSerializer(records, many=True)
    return Response(serializer.data)


# ─────────────────────────────────────────────────────────────────────────────
# Salary management (admin)
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_salary_list(request):
    """
    GET  /api/admin/salaries/  — list all employee salaries
    POST /api/admin/salaries/  — assign / update salary for an employee
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        salaries   = Salary.objects.select_related('employee').all()
        serializer = SalarySerializer(salaries, many=True)
        return Response(serializer.data)

    # POST — assign salary
    serializer = SalaryAssignSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    d = serializer.validated_data
    try:
        employee = Employee.objects.get(employee_id=d['employee_id'].upper())
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)

    salary, created = Salary.objects.update_or_create(
        employee=employee,
        defaults={
            'monthly_salary': d['monthly_salary'],
            'salary_type':    d['salary_type'],
            'currency':       d['currency'],
            'working_days':   d['working_days'],
        },
    )
    return Response(
        SalarySerializer(salary).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_salary_detail(request, employee_id):
    """GET / PUT / DELETE salary for a specific employee."""
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        employee = Employee.objects.get(employee_id=employee_id.upper())
        salary   = employee.salary
    except Employee.DoesNotExist:
        return Response({'error': 'Employee not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Salary.DoesNotExist:
        return Response({'error': 'No salary assigned yet.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(SalarySerializer(salary).data)

    if request.method == 'PUT':
        serializer = SalaryAssignSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        d = serializer.validated_data
        salary.monthly_salary = d['monthly_salary']
        salary.salary_type    = d['salary_type']
        salary.currency       = d['currency']
        salary.working_days   = d['working_days']
        salary.save()
        return Response(SalarySerializer(salary).data)

    # DELETE
    salary.delete()
    return Response({'message': 'Salary record deleted.'}, status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# Payroll
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_payroll(request):
    """
    GET /api/admin/payroll/?year=2026&month=5
    Compute (and cache) payroll for all employees for the given month.
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    today = timezone.localdate()
    year  = int(request.query_params.get('year',  today.year))
    month = int(request.query_params.get('month', today.month))

    employees = Employee.objects.filter(role=Employee.EMPLOYEE, is_approved=True)
    results   = []

    for emp in employees:
        data = calculate_payroll(emp, year, month)
        if data is None:
            continue
        payroll, _ = MonthlyPayroll.objects.update_or_create(
            employee=emp, year=year, month=month,
            defaults=data,
        )
        results.append(payroll)

    serializer = MonthlyPayrollSerializer(results, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_payroll(request):
    """
    GET /api/payroll/?year=2026&month=5
    Employee views their own payroll for a month.
    """
    today = timezone.localdate()
    year  = int(request.query_params.get('year',  today.year))
    month = int(request.query_params.get('month', today.month))

    data = calculate_payroll(request.user, year, month)
    if data is None:
        return Response({'error': 'No salary assigned yet.'}, status=status.HTTP_404_NOT_FOUND)

    payroll, _ = MonthlyPayroll.objects.update_or_create(
        employee=request.user, year=year, month=month,
        defaults=data,
    )
    return Response(MonthlyPayrollSerializer(payroll).data)


# ─────────────────────────────────────────────────────────────────────────────
# Employee Dashboard
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_dashboard(request):
    """
    GET /api/dashboard/
    Returns everything the employee dashboard needs in one call.
    """
    employee = request.user
    today    = timezone.localdate()

    # Today's attendance record
    try:
        today_record = AttendanceRecord.objects.get(employee=employee, date=today)
        today_status     = today_record.status
        today_clock_in   = today_record.clock_in_time
        today_clock_out  = today_record.clock_out_time
        today_hours      = today_record.hours_worked
    except AttendanceRecord.DoesNotExist:
        today_status    = 'not_started'
        today_clock_in  = None
        today_clock_out = None
        today_hours     = 0.0

    # Salary info
    try:
        salary_obj     = employee.salary
        monthly_salary = float(salary_obj.monthly_salary)
        daily_salary   = salary_obj.daily_rate
        hourly_salary  = salary_obj.hourly_rate
    except Salary.DoesNotExist:
        monthly_salary = 0.0
        daily_salary   = 0.0
        hourly_salary  = 0.0

    data = {
        'employee_id':       employee.employee_id,
        'name':              employee.name,
        'role':              employee.role,
        'today_clock_in':    today_clock_in,
        'today_clock_out':   today_clock_out,
        'today_status':      today_status,
        'today_hours_worked': today_hours,
        'today_accumulated': get_today_accumulated(employee),
        'week_accumulated':  get_week_accumulated(employee),
        'month_accumulated': get_month_accumulated(employee),
        'monthly_salary':    monthly_salary,
        'daily_salary':      daily_salary,
        'hourly_salary':     hourly_salary,
    }
    return Response(EmployeeDashboardSerializer(data).data)


# ─────────────────────────────────────────────────────────────────────────────
# Admin – Salary overview (for Salary tab)
# ─────────────────────────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_salary_overview(request):
    """
    GET /api/admin/salary-overview/
    Returns each employee with today's hours and accumulated earnings.
    """
    if not request.user.is_admin:
        return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)

    employees = Employee.objects.filter(role=Employee.EMPLOYEE, is_approved=True).prefetch_related('salary')
    today     = timezone.localdate()
    result    = []

    for emp in employees:
        try:
            salary_obj = emp.salary
        except Salary.DoesNotExist:
            continue

        try:
            rec = AttendanceRecord.objects.get(employee=emp, date=today)
            hours_today = rec.hours_worked
        except AttendanceRecord.DoesNotExist:
            hours_today = 0.0

        result.append({
            'employee_id':        emp.employee_id,
            'employee_name':      emp.name,
            'department':         emp.department,
            'monthly_salary':     float(salary_obj.monthly_salary),
            'currency':           salary_obj.currency,
            'hours_worked_today': hours_today,
            'accumulated_today':  round(salary_obj.hourly_rate * hours_today, 2),
            'accumulated_month':  get_month_accumulated(emp),
        })

    return Response(result)
