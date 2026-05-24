"""
AttendPay – Django Admin registrations
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Employee, Salary, DailyQRCode, AttendanceRecord, MonthlyPayroll


@admin.register(Employee)
class EmployeeAdmin(UserAdmin):
    list_display  = ('employee_id', 'name', 'email', 'role', 'department', 'is_approved', 'is_active')
    list_filter   = ('role', 'is_approved', 'is_active', 'department')
    search_fields = ('employee_id', 'name', 'email')
    ordering      = ('employee_id',)

    fieldsets = (
        (None,           {'fields': ('employee_id', 'password')}),
        ('Personal',     {'fields': ('name', 'email', 'phone', 'department', 'organization_id')}),
        ('Permissions',  {'fields': ('role', 'is_approved', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates',        {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('employee_id', 'name', 'email', 'role', 'password1', 'password2', 'is_approved'),
        }),
    )


@admin.register(Salary)
class SalaryAdmin(admin.ModelAdmin):
    list_display  = ('employee', 'monthly_salary', 'salary_type', 'currency', 'working_days')
    search_fields = ('employee__employee_id', 'employee__name')


@admin.register(DailyQRCode)
class DailyQRCodeAdmin(admin.ModelAdmin):
    list_display  = ('qr_type', 'date', 'organization_id', 'token', 'created_at')
    list_filter   = ('qr_type', 'date')
    ordering      = ('-date',)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display  = ('employee', 'date', 'status', 'clock_in_time', 'clock_out_time', 'hours_worked')
    list_filter   = ('status', 'date')
    search_fields = ('employee__employee_id', 'employee__name')
    ordering      = ('-date',)


@admin.register(MonthlyPayroll)
class MonthlyPayrollAdmin(admin.ModelAdmin):
    list_display  = ('employee', 'year', 'month', 'monthly_salary', 'days_present', 'days_absent', 'deduction', 'final_pay', 'currency')
    list_filter   = ('year', 'month')
    search_fields = ('employee__employee_id', 'employee__name')
    ordering      = ('-year', '-month')
