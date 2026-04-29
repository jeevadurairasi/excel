import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkHoursService } from '../services/work-hours.service';

interface SpreadsheetRow {
  work_type: string;
  employees: {
    [employee: string]: {
      [date: string]: number
    }
  };
}

@Component({
  selector: 'app-spreadsheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spreadsheet.component.html',
  styleUrls: ['./spreadsheet.component.css']
})
export class SpreadsheetComponent implements OnInit {
  // DATA
  spreadsheetData: SpreadsheetRow[] = [];
  employees: string[] = [];
  dates: string[] = [];

  // FIXED WORK TYPES (8 rows)
  workTypesList = [
    'Test Case Count',
    'Issue Create',
    'Test Execution',
    'Check',
    'Issue Verification',
    'Others',
    'Automation TC Execution II',
    'VerifyDebugLabMaterials II'
  ];

  // FILTERS
  weekStart: string = '';

  // UI
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private workHoursService: WorkHoursService) { }

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadSpreadsheet();
  }

  // ==================== LOAD DATA ====================
  loadSpreadsheet(): void {
  if (!this.weekStart) {
    this.showMessage('Please select week start date', 'error');
    return;
  }

  this.loading = true;

  // Calculate week end
  const startDate = new Date(this.weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4);

  const startDateStr = this.weekStart;
  const endDateStr = endDate.toISOString().split('T')[0];

  // Load all work hours for this week
  this.workHoursService.getByDateRange(startDateStr, endDateStr).subscribe({
    next: (response) => {
      // Type guard - check if data exists
      const allData = (response && response.data && Array.isArray(response.data)) ? response.data : [];

      // Generate dates (5 days)
      this.dates = [];
      for (let i = 0; i < 5; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        this.dates.push(d.toISOString().split('T')[0]);
      }

      // Get unique employees from allData
      const employeeSet = new Set<string>();
      allData.forEach((item: any) => {
        if (item && item.employee_name) {
          employeeSet.add(item.employee_name);
        }
      });
      this.employees = Array.from(employeeSet).sort();

      // Build spreadsheet with 8 work types
      this.spreadsheetData = this.workTypesList.map((workType: string) => {
        const row: SpreadsheetRow = {
          work_type: workType,
          employees: {}
        };

        // Initialize all employees
        this.employees.forEach((emp: string) => {
          row.employees[emp] = {};
          this.dates.forEach((date: string) => {
            row.employees[emp][date] = 0;
          });
        });

        // Fill in data from database
        allData.forEach((entry: any) => {
          if (entry && entry.work_type === workType && entry.employee_name) {
            if (!row.employees[entry.employee_name]) {
              row.employees[entry.employee_name] = {};
            }
            if (entry.work_date && entry.hours_logged !== undefined) {
              row.employees[entry.employee_name][entry.work_date] = entry.hours_logged;
            }
          }
        });

        return row;
      });

      this.loading = false;
      this.showMessage(`✅ Loaded spreadsheet for week starting ${this.weekStart}`, 'success');
      console.log(`✅ Loaded ${this.employees.length} employees x ${this.workTypesList.length} work types`);
    },
    error: (error) => {
      console.error('Error loading spreadsheet:', error);
      this.showMessage('Error loading spreadsheet: ' + (error.message || 'Unknown error'), 'error');
      this.loading = false;
    }
  });
}

  // ==================== CELL EDITING ====================
  onCellChange(workType: string, employee: string, date: string, newValue: any): void {
    const hours = parseFloat(newValue) || 0;

    const data = {
      employee_name: employee,
      work_date: date,
      work_type: workType,
      hours_logged: hours,
      function_role: 'Storage Sustaining',
      location: 'Bangalore, IN',
      program: 'MCHP Sustaining'
    };

    this.workHoursService.updateSpreadsheetCell(data).subscribe({
      next: (response) => {
        const rowIndex = this.spreadsheetData.findIndex(r => r.work_type === workType);
        if (rowIndex !== -1) {
          this.spreadsheetData[rowIndex].employees[employee][date] = hours;
        }
        this.showMessage('✅ Hours saved', 'success');
      },
      error: (error) => {
        this.showMessage('Error saving hours', 'error');
      }
    });
  }

  // ==================== ADD EMPLOYEE ====================
  addNewEmployee(): void {
    const newEmployee = prompt('Enter new employee name:');
    if (newEmployee && newEmployee.trim()) {
      if (!this.employees.includes(newEmployee)) {
        this.employees.push(newEmployee);
        this.employees.sort();

        this.spreadsheetData.forEach(row => {
          row.employees[newEmployee] = {};
          this.dates.forEach(date => {
            row.employees[newEmployee][date] = 0;
          });
        });

        this.showMessage(`✅ Employee "${newEmployee}" added`, 'success');
      } else {
        this.showMessage('Employee already exists', 'error');
      }
    }
  }

  // ==================== HELPERS ====================
  setDefaultDates(): void {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));

    this.weekStart = monday.toISOString().split('T')[0];
  }

  getWeekEndDate(): string {
    const start = new Date(this.weekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return end.toISOString().split('T')[0];
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getTotalHoursForEmployee(workType: string, employee: string): number {
    const row = this.spreadsheetData.find(r => r.work_type === workType);
    if (!row) return 0;
    return this.dates.reduce((sum, date) => sum + (row.employees[employee][date] || 0), 0);
  }

  getTotalHoursForDate(workType: string, date: string): number {
    const row = this.spreadsheetData.find(r => r.work_type === workType);
    if (!row) return 0;
    return this.employees.reduce((sum, emp) => sum + (row.employees[emp][date] || 0), 0);
  }

  getTotalHoursForWorkType(workType: string): number {
    const row = this.spreadsheetData.find(r => r.work_type === workType);
    if (!row) return 0;
    let total = 0;
    this.employees.forEach(emp => {
      this.dates.forEach(date => {
        total += row.employees[emp][date] || 0;
      });
    });
    return total;
  }

  getGrandTotal(): number {
    let total = 0;
    this.spreadsheetData.forEach(row => {
      total += this.getTotalHoursForWorkType(row.work_type);
    });
    return total;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${days[date.getDay()]} ${dateStr.split('-')[2]}`;
  }

  getPreviousWeek(): void {
    const current = new Date(this.weekStart);
    current.setDate(current.getDate() - 7);
    this.weekStart = current.toISOString().split('T')[0];
    this.loadSpreadsheet();
  }

  getNextWeek(): void {
    const current = new Date(this.weekStart);
    current.setDate(current.getDate() + 7);
    this.weekStart = current.toISOString().split('T')[0];
    this.loadSpreadsheet();
  }
}