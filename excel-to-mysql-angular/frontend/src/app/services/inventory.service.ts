import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // CREATE
  createItem(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/inventory/create`, data);
  }

  // READ ALL
  getAllItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory/all`);
  }

  // READ BY DATE RANGE
  getByDateRange(startDate: string, endDate: string, category?: string): Observable<any> {
    let url = `${this.apiUrl}/inventory/by-date?startDate=${startDate}&endDate=${endDate}`;
    if (category && category !== 'all') {
      url += `&category=${category}`;
    }
    return this.http.get<any>(url);
  }

  // READ BY WEEK
  getByWeek(weekStart: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory/by-week?weekStart=${weekStart}`);
  }

  // READ SINGLE
  getItem(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory/${id}`);
  }

  // UPDATE
  updateItem(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/inventory/update/${id}`, data);
  }

  // DELETE
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory/delete/${id}`);
  }

  // GET CATEGORIES
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory/categories/all`);
  }

  // GET STATS
  getStats(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/inventory/stats/range?startDate=${startDate}&endDate=${endDate}`);
  }
}