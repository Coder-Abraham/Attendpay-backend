"""
AttendPay – Serializers
"""

from django.utils import timezone
from rest_framework import serializers
from .models import Employee, Salary, DailyQRCode, AttendanceRecord, MonthlyPayroll


# ─────────────────────────────────────────────────────────────────────────────
# Auth
# ─────────────────────────────────────────────────────────────────────────────
class LoginSerializer(serializers.Serializer):
    employee_id = serializers.CharField()
    password    = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    """Used by the employee self-registration flow (after scanning Registration QR)."""
    employee_id     = serializers.CharField(max_length=20)
    name            = serializers.CharField(max_length=120)
    email           = serializers.EmailField()
    phone           = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password        = serializers.CharField(min_length=6, write_only=True)
    organization_id = serializers.CharField(max_length=40, default='ORG001')
    registration_token = serializers.CharField(write_only=True)  # from scanned QR

    def validate_employee_id(self, value):
        value = value.upper()
        if Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError('Employee ID already registered.')
        return value

    def validate_email(self, value):
        if Employee.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def validate_registration_token(self, value):
        today = timezone.localdate()
        try:
            qr = DailyQRCode.objects.get(
                token=value,
                qr_type=DailyQRCode.REGISTRATION,
                date=today,
            )
        except DailyQRCode.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired registration QR code.')
        return value

    def create(self, validated_data):
        validated_data.pop('registration_token')
        password = validated_data.pop('password')
        employee = Employee.objects.create_user(
            employee_id=validated_data.pop('employee_id'),
            password=password,
            **validated_data,
        )
        return employee


# ─────────────────────────────────────────────────────────────────────────────
# Employee
# ─────────────────────────────────────────────────────────────────────────────
class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Employee
        fields = [
            'employee_id', 'name', 'email', 'phone',
            'department', 'organization_id', 'role',
            'is_approved', 'created_at',
        ]
        read_only_fields = ['employee_id', 'role', 'created_at']


class EmployeeListSerializer(serializers.ModelSerializer):
    """Lightweight list used by admin employee tab."""
    attendance_percentage = serializers.SerializerMethodField()
    total_days_worked     = serializers.SerializerMethodField()
    monthly_salary        = serializers.SerializerMethodField()

    class Meta:
        model  = Employee
        fields = [
            'employee_id', 'name', 'email', 'department',
            'is_approved', 'attendance_percentage',
            'total_days_worked', 'monthly_salary',
        ]

    def get_attendance_percentage(self, obj):
        total   = obj.attendance.exclude(status=AttendanceRecord.ABSENT).count()
        present = obj.attendance.filter(status=AttendanceRecord.PRESENT).count()
        if total == 0:
            return 0
        return round((present / total) * 100, 1)

    def get_total_days_worked(self, obj):
        return obj.attendance.filter(status=AttendanceRecord.PRESENT).count()

    def get_monthly_salary(self, obj):
        try:
            return float(obj.salary.monthly_salary)
        except Salary.DoesNotExist:
            return None


# ─────────────────────────────────────────────────────────────────────────────
# Salary
# ─────────────────────────────────────────────────────────────────────────────
class SalarySerializer(serializers.ModelSerializer):
    employee_id   = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    daily_rate    = serializers.FloatField(read_only=True)
    hourly_rate   = serializers.FloatField(read_only=True)

    class Meta:
        model  = Salary
        fields = [
            'id', 'employee_id', 'employee_name',
            'monthly_salary', 'salary_type', 'currency',
            'working_days', 'daily_rate', 'hourly_rate',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SalaryAssignSerializer(serializers.Serializer):
    """Admin assigns / updates salary for an employee."""
    employee_id    = serializers.CharField()
    monthly_salary = serializers.DecimalField(max_digits=12, decimal_places=2)
    salary_type    = serializers.ChoiceField(choices=Salary.TYPE_CHOICES, default=Salary.FIXED_MONTHLY)
    currency       = serializers.CharField(max_length=5, default='UGX')
    working_days   = serializers.IntegerField(min_value=1, max_value=31, default=30)


# ─────────────────────────────────────────────────────────────────────────────
# QR Code
# ─────────────────────────────────────────────────────────────────────────────
class QRCodeSerializer(serializers.ModelSerializer):
    payload = serializers.SerializerMethodField()

    class Meta:
        model  = DailyQRCode
        fields = ['id', 'qr_type', 'date', 'token', 'payload', 'created_at']

    def get_payload(self, obj):
        return obj.to_payload()


# ─────────────────────────────────────────────────────────────────────────────
# Attendance
# ─────────────────────────────────────────────────────────────────────────────
class AttendanceRecordSerializer(serializers.ModelSerializer):
    employee_id   = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    hours_worked  = serializers.FloatField(read_only=True)
    duration      = serializers.CharField(source='duration_display', read_only=True)

    class Meta:
        model  = AttendanceRecord
        fields = [
            'id', 'employee_id', 'employee_name',
            'date', 'clock_in_time', 'clock_out_time',
            'clock_in_lat', 'clock_in_lng',
            'clock_out_lat', 'clock_out_lng',
            'status', 'hours_worked', 'duration',
        ]


class ClockInSerializer(serializers.Serializer):
    qr_token  = serializers.CharField()
    latitude  = serializers.FloatField()
    longitude = serializers.FloatField()


class ClockOutSerializer(serializers.Serializer):
    qr_token  = serializers.CharField()
    latitude  = serializers.FloatField()
    longitude = serializers.FloatField()


# ─────────────────────────────────────────────────────────────────────────────
# Payroll
# ─────────────────────────────────────────────────────────────────────────────
class MonthlyPayrollSerializer(serializers.ModelSerializer):
    employee_id   = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    department    = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model  = MonthlyPayroll
        fields = [
            'id', 'employee_id', 'employee_name', 'department',
            'year', 'month', 'monthly_salary', 'working_days',
            'days_present', 'days_absent', 'daily_rate',
            'deduction', 'final_pay', 'currency', 'computed_at',
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Dashboard summaries
# ─────────────────────────────────────────────────────────────────────────────
class AdminDashboardSerializer(serializers.Serializer):
    total_employees      = serializers.IntegerField()
    present_today        = serializers.IntegerField()
    absent_today         = serializers.IntegerField()
    late_today           = serializers.IntegerField()
    average_attendance   = serializers.FloatField()


class EmployeeDashboardSerializer(serializers.Serializer):
    employee_id          = serializers.CharField()
    name                 = serializers.CharField()
    role                 = serializers.CharField()
    today_clock_in       = serializers.DateTimeField(allow_null=True)
    today_clock_out      = serializers.DateTimeField(allow_null=True)
    today_status         = serializers.CharField()
    today_hours_worked   = serializers.FloatField()
    today_accumulated    = serializers.FloatField()
    week_accumulated     = serializers.FloatField()
    month_accumulated    = serializers.FloatField()
    monthly_salary       = serializers.FloatField()
    daily_salary         = serializers.FloatField()
    hourly_salary        = serializers.FloatField()
