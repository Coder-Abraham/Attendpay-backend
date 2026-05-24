# AttendPay – Django Backend

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run migrations (already done — db.sqlite3 exists)
python manage.py migrate

# 3. Seed initial data (already done)
python manage.py seed_data

# 4. Start the server
python manage.py runserver 0.0.0.0:8000
```

## Default Credentials

| Role     | Employee ID | Password |
|----------|-------------|----------|
| Admin    | ADM001      | adm001   |
| Employee | EMP001      | emp001   |
| Employee | EMP002      | emp002   |
| Employee | EMP003      | emp003   |
| Employee | EMP004      | emp004   |
| Employee | EMP005      | emp005   |

## Physical Device Testing

Update `.env` in the React Native project root:
```
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8000/api
```
Then start Django with:
```bash
python manage.py runserver 0.0.0.0:8000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | Login |
| POST | /api/auth/register/ | Employee self-registration |
| POST | /api/auth/logout/ | Logout |
| GET | /api/dashboard/ | Employee dashboard data |
| GET | /api/profile/ | Employee profile |
| POST | /api/attendance/clock-in/ | Clock in with QR token + GPS |
| POST | /api/attendance/clock-out/ | Clock out with QR token + GPS |
| GET | /api/attendance/history/ | Attendance history |
| GET | /api/qr/arrival/ | Today's arrival QR (admin) |
| GET | /api/qr/departure/ | Today's departure QR (admin) |
| GET | /api/qr/registration/ | Registration QR (admin) |
| GET | /api/admin/dashboard/ | Admin stats |
| GET | /api/admin/employees/ | All employees |
| POST | /api/admin/employees/{id}/approve/ | Approve employee |
| GET | /api/admin/attendance/ | Daily attendance report |
| POST | /api/admin/salaries/ | Assign salary |
| GET | /api/admin/salary-overview/ | Salary overview |
| GET | /api/admin/payroll/ | Monthly payroll |

## Business Rules

- **QR codes** rotate daily at midnight (auto-generated)
- **Absent rule**: employees not clocked in by 12:00 PM are marked absent (scheduler job)
- **Location**: employees must be within 100m of company GPS (0.32942, 32.61419)
- **Payroll**: `final_pay = monthly_salary - (absent_days × daily_rate)`
- **New employees** require admin approval before they can log in
