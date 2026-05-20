"""
Management command: python manage.py seed_data
Seeds the database with:
  - Admin user (ADM001 / adm001)
  - 5 employee users (EMP001-EMP005 / emp001-emp005)
  - Salary records for each employee
  - Today's QR codes (arrival, departure, registration)
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Employee, Salary, DailyQRCode
from core.qr_manager import get_or_create_daily_qr


EMPLOYEES = [
    {'employee_id': 'EMP001', 'name': 'Ssebadduka Joseph',  'email': 'josephssebadduka@uict.ac.ug',  'phone': '0756550193', 'department': 'Engineering', 'monthly_salary': 900_000},
    {'employee_id': 'EMP002', 'name': 'Usabyimana Daniel',  'email': 'danielusabyimana@uict.ac.ug',  'phone': '0700000002', 'department': 'I.T',         'monthly_salary': 1_000_000},
    {'employee_id': 'EMP003', 'name': 'Sserabidde Merina',  'email': 'merinasserabidde@uict.ac.ug',  'phone': '0700000003', 'department': 'HR',          'monthly_salary': 1_200_000},
    {'employee_id': 'EMP004', 'name': 'Otai Joshua',        'email': 'otaijoshua@uict.ac.ug',        'phone': '0700000004', 'department': 'Finance',     'monthly_salary': 1_500_000},
    {'employee_id': 'EMP005', 'name': 'Owiny Jonathan',     'email': 'jonathanowiny@uict.ac.ug',     'phone': '0700000005', 'department': 'Finance',     'monthly_salary': 600_000},
]


class Command(BaseCommand):
    help = 'Seed initial AttendPay data (admin, employees, salaries, QR codes)'

    def handle(self, *args, **options):
        self.stdout.write('Seeding AttendPay database...')

        # ── Admin ──────────────────────────────────────────────────────────
        if not Employee.objects.filter(employee_id='ADM001').exists():
            Employee.objects.create_superuser(
                employee_id='ADM001',
                password='adm001',
                name='Abraham Katandi',
                email='Katandiabraham@uict.ac.ug',
                department='Administration',
                organization_id='ORG001',
            )
            self.stdout.write(self.style.SUCCESS('  ✓ Admin ADM001 created'))
        else:
            self.stdout.write('  – Admin ADM001 already exists')

        # ── Employees ──────────────────────────────────────────────────────
        for emp_data in EMPLOYEES:
            emp_id  = emp_data['employee_id']
            salary  = emp_data.pop('monthly_salary')
            password = emp_id.lower()  # e.g. emp001

            emp, created = Employee.objects.get_or_create(
                employee_id=emp_id,
                defaults={
                    **emp_data,
                    'role':            Employee.EMPLOYEE,
                    'organization_id': 'ORG001',
                    'is_approved':     True,
                },
            )
            if created:
                emp.set_password(password)
                emp.save()
                self.stdout.write(self.style.SUCCESS(f'  ✓ Employee {emp_id} created'))
            else:
                self.stdout.write(f'  – Employee {emp_id} already exists')

            # Salary
            Salary.objects.get_or_create(
                employee=emp,
                defaults={
                    'monthly_salary': salary,
                    'salary_type':    Salary.FIXED_MONTHLY,
                    'currency':       'UGX',
                    'working_days':   30,
                },
            )

        # ── Today's QR codes ───────────────────────────────────────────────
        for qr_type in [DailyQRCode.ARRIVAL, DailyQRCode.DEPARTURE, DailyQRCode.REGISTRATION]:
            qr = get_or_create_daily_qr(qr_type)
            self.stdout.write(self.style.SUCCESS(f'  ✓ QR [{qr_type}] token={qr.token[:12]}…'))

        self.stdout.write(self.style.SUCCESS('\nSeed complete. Ready to run!'))
