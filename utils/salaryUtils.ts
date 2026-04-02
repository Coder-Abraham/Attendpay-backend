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
    const [inHour, inMinute] = clockIn.split(':').map((x) => parseInt(x));
    const [outHour, outMinute] = clockOut.split(':').map((x) => parseInt(x));

    const inTotalMinutes = inHour * 60 + inMinute;
    const outTotalMinutes = outHour * 60 + outMinute;

    return (outTotalMinutes - inTotalMinutes) / 60;
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
