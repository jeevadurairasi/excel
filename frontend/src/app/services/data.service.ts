import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  uploadSheetOne(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/sheet-one`, formData);
  }

  uploadSheetTwo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload/sheet-two`, formData);
  }

  getSheetOne(search?: string, column?: string, value?: string): Observable<any> {
    let url = `${this.apiUrl}/data/sheet-one`;
    const params = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (column && value) {
      params.push(`column=${encodeURIComponent(column)}`);
      params.push(`value=${encodeURIComponent(value)}`);
    }
    
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any>(url);
  }

  getSheetTwo(search?: string, column?: string, value?: string): Observable<any> {
    let url = `${this.apiUrl}/data/sheet-two`;
    const params = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (column && value) {
      params.push(`column=${encodeURIComponent(column)}`);
      params.push(`value=${encodeURIComponent(value)}`);
    }
    
    if (params.length > 0) url += '?' + params.join('&');
    return this.http.get<any>(url);
  }
}