import { mockSalaryData } from './mockData';

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const getEmployeeSalaryDetails = (employeeId: string) => {
  const data = mockSalaryData[employeeId];
  if (!data) {
    return {
      employeeId,
      employeeName: 'Unknown',
      monthlySalary: 0,
      salaryBreakdown: {
        monthlySalary: 0,
        dailySalary: 0,
        hourlySalary: 0,
        currency: 'USD',
      },
      todayAccumulated: 0,
      weekAccumulated: 0,
      monthAccumulated: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };
  }
  return data;
};

export const calculateHoursWorked = (clockIn: string | null, clockOut: string | null) => {
  if (!clockIn || !clockOut) return 0;

  try {
    const parseTime = (timeStr: string): number => {
      // Handle "HH:MM AM/PM" format
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return 0;
      let hour = parseInt(match[1]);
      const minute = parseInt(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return hour * 60 + minute;
    };

    const inTotalMinutes = parseTime(clockIn);
    const outTotalMinutes = parseTime(clockOut);
    const diff = outTotalMinutes - inTotalMinutes;
    return diff > 0 ? diff / 60 : 0;
  } catch {
    return 0;
  }
};

export const getSalaryConfigs = () => {
  return Object.values(mockSalaryData).map((data) => ({
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    monthlySalary: data.monthlySalary,
    currency: data.currency,
    startDate: '2023-01-01',
  }));
};

export const getAdminSalaryOverview = () => {
  return Object.values(mockSalaryData).map((data) => ({
    employeeId: data.employeeId,
    employeeName: data.employeeName,
    department: 'Engineering',
    monthlySalary: data.monthlySalary,
    hoursWorkedToday: Math.floor(Math.random() * 8) + 4,
    accumulatedToday: data.salaryBreakdown.hourlySalary * (Math.floor(Math.random() * 8) + 4),
    accumulatedThisMonth: data.monthlySalary * 0.75,
    currency: data.currency,
  }));
};
