"""
AttendPay – Core Models
=======================
Employee  →  Attendance  →  Salary
QRCode    →  validated by Attendance
"""

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


# ─────────────────────────────────────────────────────────────────────────────
# Custom User Manager
# ─────────────────────────────────────────────────────────────────────────────
class EmployeeManager(BaseUserManager):
    def create_user(self, employee_id, password=None, **extra_fields):
        if not employee_id:
            raise ValueError('Employee ID is required')
        user = self.model(employee_id=employee_id.upper(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, employee_id, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Employee.ADMIN)
        extra_fields.setdefault('is_approved', True)
        return self.create_user(employee_id, password, **extra_fields)


# ─────────────────────────────────────────────────────────────────────────────
# Employee (custom user)
# ─────────────────────────────────────────────────────────────────────────────
class Employee(AbstractBaseUser, PermissionsMixin):
    ADMIN    = 'admin'
    EMPLOYEE = 'employee'
    ROLE_CHOICES = [(ADMIN, 'Admin'), (EMPLOYEE, 'Employee')]

    # Fix reverse accessor clashes with auth.User
    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='employee_set',
        related_query_name='employee',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='employee_set',
        related_query_name='employee',
    )

    employee_id     = models.CharField(max_length=20, unique=True)
    name            = models.CharField(max_length=120)
    email           = models.EmailField(unique=True)
    phone           = models.CharField(max_length=20, blank=True)
    department      = models.CharField(max_length=80, blank=True)
    organization_id = models.CharField(max_length=40, default='ORG001')
    role            = models.CharField(max_length=10, choices=ROLE_CHOICES, default=EMPLOYEE)

    # Registration flow: employee is pending until admin approves
    is_approved     = models.BooleanField(default=False)
    is_active       = models.BooleanField(default=True)
    is_staff        = models.BooleanField(default=False)

    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    objects = EmployeeManager()

    USERNAME_FIELD  = 'employee_id'
    REQUIRED_FIELDS = ['name', 'email']

    class Meta:
        verbose_name = 'Employee'
        ordering = ['employee_id']

    def __str__(self):
        return f'{self.employee_id} – {self.name}'

    @property
    def is_admin(self):
        return self.role == self.ADMIN


# ─────────────────────────────────────────────────────────────────────────────
# Salary
# ─────────────────────────────────────────────────────────────────────────────
class Salary(models.Model):
    FIXED_MONTHLY = 'fixed_monthly'
    DAILY_WAGE    = 'daily_wage'
    HOURLY        = 'hourly'
    TYPE_CHOICES  = [
        (FIXED_MONTHLY, 'Fixed Monthly'),
        (DAILY_WAGE,    'Daily Wage'),
        (HOURLY,        'Hourly'),
    ]

    employee       = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='salary')
    monthly_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    salary_type    = models.CharField(max_length=20, choices=TYPE_CHOICES, default=FIXED_MONTHLY)
    currency       = models.CharField(max_length=5, default='UGX')
    working_days   = models.PositiveIntegerField(default=30)  # days per month used for daily rate
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Salary'

    def __str__(self):
        return f'{self.employee.employee_id} – {self.monthly_salary} {self.currency}'

    # ── Derived rates ──────────────────────────────────────────────────────
    @property
    def daily_rate(self):
        if self.working_days > 0:
            return float(self.monthly_salary) / self.working_days
        return 0.0

    @property
    def hourly_rate(self):
        """Assumes 8-hour working day."""
        return self.daily_rate / 8


# ─────────────────────────────────────────────────────────────────────────────
# Daily QR Code  (one arrival + one departure per day, auto-rotated)
# ─────────────────────────────────────────────────────────────────────────────
class DailyQRCode(models.Model):
    ARRIVAL     = 'arrival'
    DEPARTURE   = 'departure'
    REGISTRATION = 'registration'
    TYPE_CHOICES = [
        (ARRIVAL,      'Arrival'),
        (DEPARTURE,    'Departure'),
        (REGISTRATION, 'Registration'),
    ]

    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    qr_type      = models.CharField(max_length=15, choices=TYPE_CHOICES)
    date         = models.DateField()                    # valid for this date only
    token        = models.CharField(max_length=64, unique=True)  # random secret embedded in QR
    organization_id = models.CharField(max_length=40, default='ORG001')
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('qr_type', 'date', 'organization_id')
        verbose_name = 'Daily QR Code'

    def __str__(self):
        return f'{self.qr_type} – {self.date}'

    @property
    def is_valid_today(self):
        return self.date == timezone.localdate()

    def to_payload(self):
        """JSON payload that gets encoded into the QR image."""
        return {
            'type':            self.qr_type,
            'date':            str(self.date),
            'token':           self.token,
            'organization_id': self.organization_id,
            'qr_id':           str(self.id),
        }


# ─────────────────────────────────────────────────────────────────────────────
# Attendance Record
# ─────────────────────────────────────────────────────────────────────────────
class AttendanceRecord(models.Model):
    PRESENT    = 'present'
    ABSENT     = 'absent'
    INCOMPLETE = 'incomplete'   # clocked in but not out yet
    STATUS_CHOICES = [
        (PRESENT,    'Present'),
        (ABSENT,     'Absent'),
        (INCOMPLETE, 'Incomplete'),
    ]

    employee        = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date            = models.DateField()
    clock_in_time   = models.DateTimeField(null=True, blank=True)
    clock_out_time  = models.DateTimeField(null=True, blank=True)
    clock_in_lat    = models.FloatField(null=True, blank=True)
    clock_in_lng    = models.FloatField(null=True, blank=True)
    clock_out_lat   = models.FloatField(null=True, blank=True)
    clock_out_lng   = models.FloatField(null=True, blank=True)
    status          = models.CharField(max_length=12, choices=STATUS_CHOICES, default=INCOMPLETE)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date']
        verbose_name = 'Attendance Record'

    def __str__(self):
        return f'{self.employee.employee_id} – {self.date} – {self.status}'

    @property
    def hours_worked(self):
        if self.clock_in_time and self.clock_out_time:
            delta = self.clock_out_time - self.clock_in_time
            return round(delta.total_seconds() / 3600, 2)
        return 0.0

    @property
    def duration_display(self):
        if self.clock_in_time and self.clock_out_time:
            delta = self.clock_out_time - self.clock_in_time
            total_minutes = int(delta.total_seconds() // 60)
            h, m = divmod(total_minutes, 60)
            return f'{h}h {m}m'
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Monthly Payroll  (computed / cached each month)
# ─────────────────────────────────────────────────────────────────────────────
class MonthlyPayroll(models.Model):
    employee          = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    year              = models.PositiveIntegerField()
    month             = models.PositiveIntegerField()   # 1-12
    monthly_salary    = models.DecimalField(max_digits=12, decimal_places=2)
    working_days      = models.PositiveIntegerField(default=30)
    days_present      = models.PositiveIntegerField(default=0)
    days_absent       = models.PositiveIntegerField(default=0)
    daily_rate        = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deduction         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    final_pay         = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency          = models.CharField(max_length=5, default='UGX')
    computed_at       = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('employee', 'year', 'month')
        ordering = ['-year', '-month']
        verbose_name = 'Monthly Payroll'

    def __str__(self):
        return f'{self.employee.employee_id} – {self.year}/{self.month:02d} – {self.final_pay}'
