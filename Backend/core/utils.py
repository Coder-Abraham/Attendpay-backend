"""
AttendPay – Utility helpers
"""

import math
import secrets
import string
from datetime import date, timedelta
from django.utils import timezone
from django.conf import settings


# ─────────────────────────────────────────────────────────────────────────────
# GPS distance (Haversine formula)
# ─────────────────────────────────────────────────────────────────────────────
def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in metres between two GPS coordinates."""
    R = 6_371_000  # Earth radius in metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def is_within_company_premises(latitude: float, longitude: float) -> bool:
    """Check employee is within CLOCK_IN_RADIUS_METERS of company HQ."""
    dist = haversine_distance(
        settings.COMPANY_LATITUDE, settings.COMPANY_LONGITUDE,
        latitude, longitude,
    )
    return dist <= settings.CLOCK_IN_RADIUS_METERS


# ─────────────────────────────────────────────────────────────────────────────
# Secure token generator
# ─────────────────────────────────────────────────────────────────────────────
def generate_qr_token(length: int = 48) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


# ─────────────────────────────────────────────────────────────────────────────
# Payroll calculation
# ─────────────────────────────────────────────────────────────────────────────
def calculate_payroll(employee, year: int, month: int):
    """
    Compute payroll for an employee for a given month.
    Returns a dict with all fields needed for MonthlyPayroll.
    """
    from .models import AttendanceRecord, Salary

    try:
        salary_obj = employee.salary
    except Salary.DoesNotExist:
        return None

    monthly_salary = float(salary_obj.monthly_salary)
    working_days   = salary_obj.working_days
    daily_rate     = monthly_salary / working_days if working_days else 0

    # Count attendance for the month
    records = AttendanceRecord.objects.filter(
        employee=employee,
        date__year=year,
        date__month=month,
    )
    days_present = records.filter(status=AttendanceRecord.PRESENT).count()
    days_absent  = records.filter(status=AttendanceRecord.ABSENT).count()

    deduction  = daily_rate * days_absent
    final_pay  = max(monthly_salary - deduction, 0)

    return {
        'monthly_salary': monthly_salary,
        'working_days':   working_days,
        'days_present':   days_present,
        'days_absent':    days_absent,
        'daily_rate':     round(daily_rate, 2),
        'deduction':      round(deduction, 2),
        'final_pay':      round(final_pay, 2),
        'currency':       salary_obj.currency,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Accumulated earnings helpers
# ─────────────────────────────────────────────────────────────────────────────
def get_today_accumulated(employee) -> float:
    """Earnings for today based on hours clocked in so far."""
    from .models import AttendanceRecord, Salary
    try:
        salary_obj = employee.salary
    except Salary.DoesNotExist:
        return 0.0

    today = timezone.localdate()
    try:
        record = AttendanceRecord.objects.get(employee=employee, date=today)
    except AttendanceRecord.DoesNotExist:
        return 0.0

    hours = record.hours_worked
    return round(salary_obj.hourly_rate * hours, 2)


def get_week_accumulated(employee) -> float:
    """Earnings for the current ISO week."""
    from .models import AttendanceRecord, Salary
    try:
        salary_obj = employee.salary
    except Salary.DoesNotExist:
        return 0.0

    today      = timezone.localdate()
    week_start = today - timedelta(days=today.weekday())
    records    = AttendanceRecord.objects.filter(
        employee=employee,
        date__gte=week_start,
        date__lte=today,
        status=AttendanceRecord.PRESENT,
    )
    total_hours = sum(r.hours_worked for r in records)
    return round(salary_obj.hourly_rate * total_hours, 2)


def get_month_accumulated(employee) -> float:
    """Earnings accumulated so far this month (days present × daily rate)."""
    from .models import AttendanceRecord, Salary
    try:
        salary_obj = employee.salary
    except Salary.DoesNotExist:
        return 0.0

    today   = timezone.localdate()
    records = AttendanceRecord.objects.filter(
        employee=employee,
        date__year=today.year,
        date__month=today.month,
        status=AttendanceRecord.PRESENT,
    )
    total_hours = sum(r.hours_worked for r in records)
    return round(salary_obj.hourly_rate * total_hours, 2)
