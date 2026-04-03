export interface SalaryConfig {
  employeeId: string;
  employeeName: string;
  monthlySalary: number; 
  currency: string;
  startDate: string; 
}

export interface SalaryBreakdown {
  monthlySalary: number;
  dailySalary: number; 
  hourlySalary: number; 
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
