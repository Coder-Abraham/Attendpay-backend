"""
AttendPay – QR Code Manager
Handles daily QR rotation and auto-generation.
"""

from django.utils import timezone
from .models import DailyQRCode
from .utils import generate_qr_token


def get_or_create_daily_qr(qr_type: str, organization_id: str = 'ORG001') -> DailyQRCode:
    """
    Return today's QR code for the given type, creating it if it doesn't exist.
    This is the single source of truth for QR generation.
    """
    today = timezone.localdate()
    qr, created = DailyQRCode.objects.get_or_create(
        qr_type=qr_type,
        date=today,
        organization_id=organization_id,
        defaults={'token': generate_qr_token()},
    )
    return qr


def rotate_daily_qr_codes():
    """
    Called by the scheduler at midnight.
    Pre-generates arrival + departure QR codes for the new day.
    Old codes are left in DB (for audit) but date mismatch makes them invalid.
    """
    today = timezone.localdate()
    for qr_type in [DailyQRCode.ARRIVAL, DailyQRCode.DEPARTURE]:
        DailyQRCode.objects.get_or_create(
            qr_type=qr_type,
            date=today,
            organization_id='ORG001',
            defaults={'token': generate_qr_token()},
        )
