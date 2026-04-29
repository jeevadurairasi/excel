import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  // SHEET 1 DATA
  sheetOneData: any[] = [];
  sheetOneColumns: string[] = [];
  uploadingSheet1 = false;
  uploadSuccess1 = false;
  uploadMessage1 = '';

  // SHEET 2 DATA
  sheetTwoData: any[] = [];
  sheetTwoColumns: string[] = [];
  uploadingSheet2 = false;
  uploadSuccess2 = false;
  uploadMessage2 = '';

  // FILTER & SEARCH
  searchTerm = '';
  filterColumn = '';
  filterValue = '';
  activeTab: 'upload' | 'view' = 'upload';
  allColumns: string[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  // FILE UPLOAD SHEET 1
  onFileSelectedSheet1(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingSheet1 = true;
    this.uploadSuccess1 = false;
    this.uploadMessage1 = '';

    this.dataService.uploadSheetOne(file).subscribe({
      next: (response) => {
        this.uploadSuccess1 = true;
        this.uploadMessage1 = response.message;
        
        setTimeout(() => {
          this.uploadSuccess1 = false;
        }, 3000);

        this.uploadingSheet1 = false;
        this.loadAllData();
        event.target.value = '';
      },
      error: (error) => {
        const errorMsg = error.error?.error || error.message || 'Upload failed';
        alert(`❌ Error: ${errorMsg}`);
        this.uploadingSheet1 = false;
        event.target.value = '';
      }
    });
  }

  // FILE UPLOAD SHEET 2
  onFileSelectedSheet2(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingSheet2 = true;
    this.uploadSuccess2 = false;
    this.uploadMessage2 = '';

    this.dataService.uploadSheetTwo(file).subscribe({
      next: (response) => {
        this.uploadSuccess2 = true;
        this.uploadMessage2 = response.message;
        
        setTimeout(() => {
          this.uploadSuccess2 = false;
        }, 3000);

        this.uploadingSheet2 = false;
        this.loadAllData();
        event.target.value = '';
      },
      error: (error) => {
        const errorMsg = error.error?.error || error.message || 'Upload failed';
        alert(`❌ Error: ${errorMsg}`);
        this.uploadingSheet2 = false;
        event.target.value = '';
      }
    });
  }

  // LOAD DATA FROM DATABASE
  loadAllData(): void {
    console.log('📊 Loading data from database...');

    this.dataService.getSheetOne().subscribe({
      next: (response) => {
        this.sheetOneData = response.data || [];
        
        if (this.sheetOneData.length > 0) {
          this.sheetOneColumns = Object.keys(this.sheetOneData[0])
            .filter(key => !['id', 'created_at', 'updated_at'].includes(key));
          
          console.log(`✅ Loaded ${this.sheetOneData.length} rows from Sheet 1`);
          this.updateAllColumns();
        }
      },
      error: (error) => console.error('❌ Error loading Sheet 1:', error)
    });

    this.dataService.getSheetTwo().subscribe({
      next: (response) => {
        this.sheetTwoData = response.data || [];
        
        if (this.sheetTwoData.length > 0) {
          this.sheetTwoColumns = Object.keys(this.sheetTwoData[0])
            .filter(key => !['id', 'created_at', 'updated_at'].includes(key));
          
          console.log(`✅ Loaded ${this.sheetTwoData.length} rows from Sheet 2`);
          this.updateAllColumns();
        }
      },
      error: (error) => console.error('❌ Error loading Sheet 2:', error)
    });
  }

  updateAllColumns(): void {
    const sheet1Cols = this.sheetOneColumns || [];
    const sheet2Cols = this.sheetTwoColumns || [];
    this.allColumns = [...new Set([...sheet1Cols, ...sheet2Cols])];
    console.log('📋 Available columns:', this.allColumns);
  }

  // SEARCH & FILTER
  onSearch(): void {
    const hasSearch = this.searchTerm.trim().length > 0;
    const hasFilter = this.filterValue.trim().length > 0 && this.filterColumn.length > 0;

    if (!hasSearch && !hasFilter) {
      alert('⚠️ Please enter a serial number or select a filter!');
      return;
    }

    console.log('🔍 Searching with:', { 
      search: this.searchTerm, 
      column: this.filterColumn, 
      value: this.filterValue 
    });

    this.dataService.getSheetOne(this.searchTerm, this.filterColumn, this.filterValue)
      .subscribe({
        next: (response) => {
          this.sheetOneData = response.data || [];
          console.log(`✅ Sheet 1 search result: ${this.sheetOneData.length} rows`);
        },
        error: (error) => console.error('❌ Error searching Sheet 1:', error)
      });

    this.dataService.getSheetTwo(this.searchTerm, this.filterColumn, this.filterValue)
      .subscribe({
        next: (response) => {
          this.sheetTwoData = response.data || [];
          console.log(`✅ Sheet 2 search result: ${this.sheetTwoData.length} rows`);
        },
        error: (error) => console.error('❌ Error searching Sheet 2:', error)
      });
  }

  onClear(): void {
    console.log('🧹 Clearing all filters...');
    this.searchTerm = '';
    this.filterColumn = '';
    this.filterValue = '';
    this.loadAllData();
  }
}