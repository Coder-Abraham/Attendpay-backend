"""
AttendPay – Background Scheduler
Runs two daily jobs:
  1. midnight  → rotate QR codes
  2. 12:00 PM  → mark absent employees who haven't clocked in
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
import logging

logger = logging.getLogger(__name__)


def mark_absent_job():
    """
    Runs at 12:00 PM local time.
    Any approved employee with no clock-in record for today is marked absent.
    """
    from django.utils import timezone
    from .models import Employee, AttendanceRecord

    today     = timezone.localdate()
    employees = Employee.objects.filter(role=Employee.EMPLOYEE, is_approved=True)

    for emp in employees:
        record, created = AttendanceRecord.objects.get_or_create(
            employee=emp,
            date=today,
            defaults={'status': AttendanceRecord.ABSENT},
        )
        if not created and record.clock_in_time is None:
            record.status = AttendanceRecord.ABSENT
            record.save(update_fields=['status'])

    logger.info(f'[Scheduler] mark_absent_job ran for {today}')


def rotate_qr_job():
    """Runs at midnight — pre-generate tomorrow's QR codes."""
    from .qr_manager import rotate_daily_qr_codes
    rotate_daily_qr_codes()
    logger.info('[Scheduler] rotate_qr_job ran — new daily QR codes generated.')


def start():
    scheduler = BackgroundScheduler(timezone='Africa/Kampala')
    scheduler.add_jobstore(DjangoJobStore(), 'default')

    # Rotate QR codes at midnight
    scheduler.add_job(
        rotate_qr_job,
        trigger=CronTrigger(hour=0, minute=0),
        id='rotate_qr_codes',
        max_instances=1,
        replace_existing=True,
    )

    # Mark absent at noon
    scheduler.add_job(
        mark_absent_job,
        trigger=CronTrigger(hour=12, minute=0),
        id='mark_absent',
        max_instances=1,
        replace_existing=True,
    )

    scheduler.start()
    logger.info('[Scheduler] APScheduler started.')
