# Backend Integration Guide

This document describes the backend integration structure for the AttendPay mobile application.

## Overview

The frontend is structured with hooks and services to prepare for backend integration. Currently, the backend services return mock data to allow the frontend to function independently. When your backend is ready, you can replace the mock implementations with actual API calls.

## Project Structure

```
AttendPay/
├── services/              # Backend service layer
│   ├── api.ts            # Core API client and configuration
│   ├── authService.ts    # Authentication services
│   ├── employeeService.ts # Employee-related services
│   ├── adminService.ts   # Admin-related services
│   └── index.ts          # Service exports
├── hooks/                 # Custom React hooks for services
│   ├── useEmployee.ts    # Employee operations hook
│   ├── useAdmin.ts       # Admin operations hook
│   └── index.ts          # Hook exports
├── context/               # React context for global state
│   └── AuthContext.tsx   # Authentication state management
└── (other app files)
```

## Setting Up Backend Integration

### Step 1: Configure API Endpoint

Edit `services/api.ts` and update the `API_CONFIG`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-api.com/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};
```

Or use environment variables in `.env`:

```
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Step 2: Replace Mock Implementations

Each service file contains TODO comments indicating where to replace mock implementations with actual API calls.

#### Example: Login Service

**Before (Mock):**
```typescript
async login(employeeId: string) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: { userId: employeeId, ... }
      });
    }, 1000);
  });
}
```

**After (Real API):**
```typescript
async login(employeeId: string) {
  return apiClient.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    { employeeId }
  );
}
```

## API Service Architecture

### Core API Client (`api.ts`)

The `APIClient` class provides:

- **HTTP Methods**: `get()`, `post()`, `put()`, `patch()`, `delete()`
- **Authentication**: Automatic Bearer token injection
- **Error Handling**: Retry logic and error recovery
- **Token Management**: `setAuthToken()`, `getAuthToken()`, `clearAuthToken()`

### Service Classes

Each service wraps the API client and provides domain-specific methods:

- **AuthService**: Login, register, logout, token validation
- **EmployeeService**: Profile, attendance, salary, clock in/out
- **AdminService**: Employee management, reports, QR code generation

### Custom Hooks

Hooks provide state management and loading states:

```typescript
const { 
  profile, 
  loading, 
  error, 
  fetchProfile, 
  clockIn, 
  clockOut 
} = useEmployee();

// Use in components
useEffect(() => {
  fetchProfile();
}, []);
```

## API Endpoints (Expected Backend Structure)

### Authentication
- `POST /auth/login` - Login with employee ID
- `POST /auth/register` - Register new account
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/validate` - Validate token

### Employee
- `GET /employees/profile` - Get employee profile
- `PUT /employees/profile` - Update profile
- `GET /employees/attendance` - Get attendance records
- `POST /employees/clock-in` - Clock in
- `POST /employees/clock-out` - Clock out
- `GET /employees/salary` - Get salary details

### Admin
- `GET /admin/employees` - List all employees
- `GET /admin/attendance-report` - Get attendance report
- `GET /admin/salary-config` - Get salary configuration
- `POST /admin/qr-code` - Generate QR code
- `PUT /admin/employees/:id` - Update employee
- `DELETE /admin/employees/:id` - Delete employee

### Attendance
- `POST /attendance/scan` - Scan QR code
- `GET /attendance/records` - Get records
- `GET /attendance/daily-report` - Daily report

## Token Management

### Storing Tokens

After login, store the token:

```typescript
const response = await authService.login(employeeId);
if (response.data?.token) {
  await authService.saveToken(response.data.token);
}
```

### Automatic Token Injection

The API client automatically adds the token to all requests:

```
Authorization: Bearer <token>
```

### Token Refresh

Implement token refresh in AuthContext:

```typescript
const refreshToken = async () => {
  const response = await authService.validateToken(storedToken);
  if (!response.success) {
    // Token invalid, initiate logout
    logout();
  }
};
```

## Error Handling

### Global Error Handler

Errors from API calls include:

```typescript
{
  success: false,
  error: "Error message"
}
```

### Using in Components

```typescript
const { clockIn, error, loading } = useEmployee();

const handleClockIn = async () => {
  const success = await clockIn();
  if (!success) {
    Alert.alert('Error', error);
  }
};
```

## Testing the Integration

### Mock Mode (Development)

Services automatically use mock data. This allows development without a backend.

### Real API Mode (Production)

1. Comment out mock implementations
2. Uncomment actual API calls
3. Update `API_CONFIG.BASE_URL`
4. Test endpoints using tools like Postman

## Security Considerations

### 1. HTTPS Only

Always use HTTPS URLs in production:
```typescript
BASE_URL: 'https://api.attendpay.com/api' // Not http://
```

### 2. Token Storage

Tokens are stored in AsyncStorage (suitable for Expo). For enhanced security in production:

```typescript
// Consider using expo-secure-store
import * as SecureStore from 'expo-secure-store';

async saveToken(token: string) {
  await SecureStore.setItemAsync('authToken', token);
}
```

### 3. SSL Pinning

For maximum security, implement SSL pinning:

```typescript
// In api.ts
const certificatePin = 'YOUR_CERT_HASH';
// Implement cert pinning logic
```

## Common Integration Tasks

### Add New API Endpoint

1. Add to `API_ENDPOINTS` in `api.ts`
2. Add method to appropriate service
3. Create custom hook if needed
4. Use in component

### Handle Offline Mode

```typescript
// In api.ts
if (!isNetworkConnected) {
  return { success: false, error: 'No internet connection' };
}
```

### Add Request Interceptor

```typescript
private async request<T>(endpoint: string, options: RequestInit) {
  // Log all requests
  console.log(`[API] ${options.method} ${endpoint}`);
  
  // Continue with request...
}
```

## Environment Configuration

Create `.env` file:

```env
EXPO_PUBLIC_API_URL=https://api.attendpay.com/api
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENV=production
```

Use in code:

```typescript
const baseUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Debugging

### Enable Request Logging

Add to `api.ts`:

```typescript
if (__DEV__) {
  console.log(`[API] ${method} ${url}`);
  console.log('Headers:', headers);
  console.log('Body:', body);
}
```

### Monitor Network Traffic

Use React Native debugger or proxy tools:

```bash
# Using Charles Proxy
export REACT_NATIVE_DEBUGGER_PROXY=127.0.0.1:8888
```

## Next Steps

1. Set up your backend server with the expected endpoints
2. Update `API_CONFIG.BASE_URL` to point to your backend
3. Replace mock implementations with actual API calls
4. Test each endpoint thoroughly
5. Implement error handling and user feedback
6. Deploy to production

## Support

For questions about backend integration, refer to:
- API documentation: (add your backend docs URL)
- Service implementations in `/services` directory
- Hook usage examples in component files

---

**Last Updated**: 2026-04-02
**Version**: 1.0.0
