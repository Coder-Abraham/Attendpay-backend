"""
AttendPay – API URL Routes
==========================

Auth
  POST   /api/auth/login/
  POST   /api/auth/register/
  POST   /api/auth/logout/

Employee (self)
  GET    /api/profile/
  PATCH  /api/profile/
  GET    /api/dashboard/
  GET    /api/attendance/history/
  GET    /api/payroll/

Attendance
  POST   /api/attendance/clock-in/
  POST   /api/attendance/clock-out/

QR Codes (admin)
  GET    /api/qr/arrival/
  GET    /api/qr/departure/
  GET    /api/qr/registration/

Admin
  GET    /api/admin/dashboard/
  GET    /api/admin/employees/
  GET    /api/admin/employees/<id>/
  PATCH  /api/admin/employees/<id>/
  POST   /api/admin/employees/<id>/approve/
  GET    /api/admin/attendance/
  GET    /api/admin/salaries/
  POST   /api/admin/salaries/
  GET    /api/admin/salaries/<id>/
  PUT    /api/admin/salaries/<id>/
  DELETE /api/admin/salaries/<id>/
  GET    /api/admin/salary-overview/
  GET    /api/admin/payroll/
"""

from django.urls import path
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────
    path('auth/login/',    views.login_view,    name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/',   views.logout_view,   name='logout'),

    # ── Employee self-service ─────────────────────────────────────────────
    path('profile/',   views.employee_profile,   name='employee-profile'),
    path('dashboard/', views.employee_dashboard, name='employee-dashboard'),
    path('payroll/',   views.employee_payroll,   name='employee-payroll'),

    # ── Attendance ────────────────────────────────────────────────────────
    path('attendance/clock-in/',  views.clock_in,                    name='clock-in'),
    path('attendance/clock-out/', views.clock_out,                   name='clock-out'),
    path('attendance/history/',   views.employee_attendance_history, name='attendance-history'),

    # ── QR Codes ──────────────────────────────────────────────────────────
    path('qr/<str:qr_type>/', views.get_daily_qr, name='daily-qr'),

    # ── Admin ─────────────────────────────────────────────────────────────
    path('admin/dashboard/',                        views.admin_dashboard,       name='admin-dashboard'),
    path('admin/employees/',                        views.admin_employee_list,   name='admin-employee-list'),
    path('admin/employees/<str:employee_id>/',      views.admin_employee_detail, name='admin-employee-detail'),
    path('admin/employees/<str:employee_id>/approve/', views.admin_approve_employee, name='admin-approve-employee'),
    path('admin/attendance/',                       views.admin_attendance_report, name='admin-attendance'),
    path('admin/salaries/',                         views.admin_salary_list,     name='admin-salary-list'),
    path('admin/salaries/<str:employee_id>/',       views.admin_salary_detail,   name='admin-salary-detail'),
    path('admin/salary-overview/',                  views.admin_salary_overview, name='admin-salary-overview'),
    path('admin/payroll/',                          views.admin_payroll,         name='admin-payroll'),
]
