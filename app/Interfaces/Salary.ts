export interface SalaryConfig {
  employeeId: string;
  employeeName: string;
  monthlySalary: number; // Monthly salary in currency
  currency: string; // e.g., "USD", "EUR"
  startDate: string; // Date when salary becomes effective (YYYY-MM-DD)
}

export interface SalaryBreakdown {
  monthlySalary: number;
  dailySalary: number; // Monthly / 22 (average working days)
  hourlySalary: number; // Daily / 8 (standard working hours)
  currency: string;
}

export interface AccumulatedSalary {
  employeeId: string;
  date: string;
  hoursWorked: number;
  accumulatedAmount: number;
  currency: string;
  breakdown: {
    hoursCount: number;
    hourlyRate: number;
    dailyTotal?: number;
  };
}

export interface EmployeeSalaryDetails {
  employeeId: string;
  employeeName: string;
  monthlySalary: number;
  salaryBreakdown: SalaryBreakdown;
  todayAccumulated: number;
  weekAccumulated: number;
  monthAccumulated: number;
  currency: string;
  lastUpdated: string;
}

export interface AdminSalaryView {
  employeeId: string;
  employeeName: string;
  department: string;
  monthlySalary: number;
  hoursWorkedToday: number;
  accumulatedToday: number;
  accumulatedThisMonth: number;
  currency: string;
}
