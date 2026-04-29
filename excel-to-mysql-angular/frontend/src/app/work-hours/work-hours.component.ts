import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkHoursService } from '../services/work-hours.service';

@Component({
  selector: 'app-work-hours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './work-hours.component.html',
  styleUrls: ['./work-hours.component.css']
})
export class WorkHoursComponent implements OnInit {
  // DATA
  workEntries: any[] = [];
  employees: string[] = [];
  workTypes: string[] = [];
  summary: any[] = [];

  // FORM
  formData = {
    employee_name: '',
    function_role: '',
    location: '',
    program: '',
    work_type: '',
    work_date: '',
    hours_logged: 0,
    description: ''
  };

  editingId: number | null = null;

  // FILTERS
  filterType: 'all' | 'date-range' | 'week' = 'all';
  startDate: string = '';
  endDate: string = '';
  weekStart: string = '';
  selectedEmployee: string = 'all';
  selectedWorkType: string = 'all';
  viewType: 'table' | 'summary' = 'table';

  // UI
  showForm = false;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private workHoursService: WorkHoursService) { }

  ngOnInit(): void {
    this.loadAllEntries();
    this.loadEmployees();
    this.loadWorkTypes();
    this.setDefaultDates();
  }

  // ==================== LOAD DATA ====================
  loadAllEntries(): void {
    this.loading = true;
    this.workHoursService.getAllEntries().subscribe({
      next: (response) => {
        this.workEntries = response.data || [];
        this.loading = false;
        console.log(`✅ Loaded ${this.workEntries.length} entries`);
      },
      error: (error) => {
        this.showMessage('Error loading entries', 'error');
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    this.workHoursService.getEmployees().subscribe({
      next: (response) => {
        this.employees = response.employees || [];
      },
      error: (error) => console.error('Error loading employees:', error)
    });
  }

  loadWorkTypes(): void {
    this.workHoursService.getWorkTypes().subscribe({
      next: (response) => {
        this.workTypes = response.workTypes || [];
      },
      error: (error) => console.error('Error loading work types:', error)
    });
  }

  // ==================== FILTER DATA ====================
  onFilterChange(): void {
    if (this.filterType === 'all') {
      this.loadAllEntries();
    } else if (this.filterType === 'date-range') {
      this.filterByDateRange();
    } else if (this.filterType === 'week') {
      this.filterByWeek();
    }
  }

  filterByDateRange(): void {
    if (!this.startDate || !this.endDate) {
      this.showMessage('Please select both start and end dates', 'error');
      return;
    }

    this.loading = true;
    this.workHoursService.getByDateRange(
      this.startDate,
      this.endDate,
      this.selectedEmployee,
      this.selectedWorkType
    ).subscribe({
      next: (response) => {
        this.workEntries = response.data || [];
        this.loading = false;
        this.showMessage(`Loaded ${this.workEntries.length} entries`, 'success');
      },
      error: (error) => {
        this.showMessage('Error filtering by date', 'error');
        this.loading = false;
      }
    });
  }

  filterByWeek(): void {
    if (!this.weekStart) {
      this.showMessage('Please select a week start date', 'error');
      return;
    }

    this.loading = true;
    this.workHoursService.getByWeek(this.weekStart).subscribe({
      next: (response) => {
        this.workEntries = response.data || [];
        this.loading = false;
        this.showMessage(`Loaded ${this.workEntries.length} entries for the week (5 days)`, 'success');
      },
      error: (error) => {
        this.showMessage('Error filtering by week', 'error');
        this.loading = false;
      }
    });
  }

  // ==================== SUMMARY VIEW ====================
  loadSummary(): void {
    if (!this.startDate || !this.endDate) {
      this.showMessage('Please select both start and end dates', 'error');
      return;
    }

    this.loading = true;
    this.workHoursService.getSummary(this.startDate, this.endDate).subscribe({
      next: (response) => {
        this.summary = response.data || [];
        this.loading = false;
        this.showMessage(`Loaded summary for ${this.summary.length} entries`, 'success');
      },
      error: (error) => {
        this.showMessage('Error loading summary', 'error');
        this.loading = false;
      }
    });
  }

  // ==================== CRUD OPERATIONS ====================
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.formData = {
      employee_name: '',
      function_role: '',
      location: '',
      program: '',
      work_type: '',
      work_date: '',
      hours_logged: 0,
      description: ''
    };
    this.editingId = null;
  }

  createEntry(): void {
    if (!this.formData.employee_name || !this.formData.function_role || 
        !this.formData.work_type || !this.formData.work_date || !this.formData.hours_logged) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    this.loading = true;
    this.workHoursService.createEntry(this.formData).subscribe({
      next: (response) => {
        this.showMessage('✅ Entry created successfully', 'success');
        this.resetForm();
        this.showForm = false;
        this.loadAllEntries();
        this.loadEmployees();
        this.loadWorkTypes();
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Error creating entry', 'error');
        this.loading = false;
      }
    });
  }

  editEntry(entry: any): void {
    this.formData = { ...entry };
    this.editingId = entry.id;
    this.showForm = true;
  }

  updateEntry(): void {
    if (!this.editingId) return;

    if (!this.formData.employee_name || !this.formData.function_role || 
        !this.formData.work_type || !this.formData.work_date || !this.formData.hours_logged) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    this.loading = true;
    this.workHoursService.updateEntry(this.editingId, this.formData).subscribe({
      next: (response) => {
        this.showMessage('✅ Entry updated successfully', 'success');
        this.resetForm();
        this.showForm = false;
        this.loadAllEntries();
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Error updating entry', 'error');
        this.loading = false;
      }
    });
  }

  deleteEntry(id: number): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.loading = true;
      this.workHoursService.deleteEntry(id).subscribe({
        next: (response) => {
          this.showMessage('✅ Entry deleted successfully', 'success');
          this.loadAllEntries();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error deleting entry', 'error');
          this.loading = false;
        }
      });
    }
  }

  saveEntry(): void {
    if (this.editingId) {
      this.updateEntry();
    } else {
      this.createEntry();
    }
  }

  // ==================== HELPERS ====================
  setDefaultDates(): void {
    const today = new Date();
    const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = fiveDaysAgo.toISOString().split('T')[0];
    this.weekStart = fiveDaysAgo.toISOString().split('T')[0];
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getTotalHours(): number {
    return this.workEntries.reduce((sum, entry) => sum + entry.hours_logged, 0);
  }

  getTotalHoursByType(workType: string): number {
    return this.workEntries
      .filter(entry => entry.work_type === workType)
      .reduce((sum, entry) => sum + entry.hours_logged, 0);
  }

  getEmployeeHours(employee: string): number {
    return this.workEntries
      .filter(entry => entry.employee_name === employee)
      .reduce((sum, entry) => sum + entry.hours_logged, 0);
  }
}