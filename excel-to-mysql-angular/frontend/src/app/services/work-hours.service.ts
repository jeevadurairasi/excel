import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WorkHoursService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // CREATE
  createEntry(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/work-hours/create`, data);
  }

  // READ ALL
  getAllEntries(): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/all`);
  }

  // READ BY DATE RANGE
  getByDateRange(startDate: string, endDate: string, employee_name?: string, work_type?: string): Observable<any> {
    let url = `${this.apiUrl}/work-hours/by-date-range?startDate=${startDate}&endDate=${endDate}`;
    if (employee_name && employee_name !== 'all') {
      url += `&employee_name=${employee_name}`;
    }
    if (work_type && work_type !== 'all') {
      url += `&work_type=${work_type}`;
    }
    return this.http.get<any>(url);
  }

  // READ BY WEEK (5 DAYS)
  getByWeek(weekStart: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/by-week?weekStart=${weekStart}`);
  }

  // READ SINGLE
  getEntry(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/${id}`);
  }

  // UPDATE
  updateEntry(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/work-hours/update/${id}`, data);
  }

  // DELETE
  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/work-hours/delete/${id}`);
  }

  // GET EMPLOYEES
  getEmployees(): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/employees/list`);
  }

  // GET WORK TYPES
  getWorkTypes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/work-types/list`);
  }

  // GET SUMMARY
  getSummary(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/summary/by-date?startDate=${startDate}&endDate=${endDate}`);
  }

  // GET SPREADSHEET VIEW
  getSpreadsheetView(weekStart: string, work_type: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/work-hours/spreadsheet/view?weekStart=${weekStart}&work_type=${encodeURIComponent(work_type)}`);
  }

  // UPDATE SPREADSHEET CELL
  updateSpreadsheetCell(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/work-hours/spreadsheet/update-cell`, data);
  }
}