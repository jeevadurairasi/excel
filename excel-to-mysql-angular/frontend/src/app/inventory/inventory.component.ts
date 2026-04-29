import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../services/inventory.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  // DATA
  inventoryItems: any[] = [];
  categories: string[] = [];

  // FORM
  formData = {
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: '',
    entry_date: ''
  };

  editingId: number | null = null;

  // FILTERS
  filterType: 'all' | 'date-range' | 'week' = 'all';
  startDate: string = '';
  endDate: string = '';
  weekStart: string = '';
  selectedCategory: string = 'all';

  // UI
  showForm = false;
  loading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    this.loadAllItems();
    this.loadCategories();
    this.setDefaultDates();
  }

  // ==================== LOAD DATA ====================
  loadAllItems(): void {
    this.loading = true;
    this.inventoryService.getAllItems().subscribe({
      next: (response) => {
        this.inventoryItems = response.data || [];
        this.loading = false;
        console.log(`✅ Loaded ${this.inventoryItems.length} items`);
      },
      error: (error) => {
        this.showMessage('Error loading items', 'error');
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.inventoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.categories || [];
      },
      error: (error) => console.error('Error loading categories:', error)
    });
  }

  // ==================== FILTER DATA ====================
  onFilterChange(): void {
    if (this.filterType === 'all') {
      this.loadAllItems();
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
    this.inventoryService.getByDateRange(this.startDate, this.endDate, this.selectedCategory).subscribe({
      next: (response) => {
        this.inventoryItems = response.data || [];
        this.loading = false;
        this.showMessage(`Loaded ${this.inventoryItems.length} items`, 'success');
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
    this.inventoryService.getByWeek(this.weekStart).subscribe({
      next: (response) => {
        this.inventoryItems = response.data || [];
        this.loading = false;
        this.showMessage(`Loaded ${this.inventoryItems.length} items for the week`, 'success');
      },
      error: (error) => {
        this.showMessage('Error filtering by week', 'error');
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
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      category: '',
      entry_date: ''
    };
    this.editingId = null;
  }

  createItem(): void {
    if (!this.formData.name || !this.formData.quantity || !this.formData.price || !this.formData.entry_date) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    this.loading = true;
    this.inventoryService.createItem(this.formData).subscribe({
      next: (response) => {
        this.showMessage('✅ Item created successfully', 'success');
        this.resetForm();
        this.showForm = false;
        this.loadAllItems();
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Error creating item', 'error');
        this.loading = false;
      }
    });
  }

  editItem(item: any): void {
    this.formData = { ...item };
    this.editingId = item.id;
    this.showForm = true;
  }

  updateItem(): void {
    if (!this.editingId) return;

    if (!this.formData.name || !this.formData.quantity || !this.formData.price || !this.formData.entry_date) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    this.loading = true;
    this.inventoryService.updateItem(this.editingId, this.formData).subscribe({
      next: (response) => {
        this.showMessage('✅ Item updated successfully', 'success');
        this.resetForm();
        this.showForm = false;
        this.loadAllItems();
        this.loading = false;
      },
      error: (error) => {
        this.showMessage('Error updating item', 'error');
        this.loading = false;
      }
    });
  }

  deleteItem(id: number): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.loading = true;
      this.inventoryService.deleteItem(id).subscribe({
        next: (response) => {
          this.showMessage('✅ Item deleted successfully', 'success');
          this.loadAllItems();
          this.loading = false;
        },
        error: (error) => {
          this.showMessage('Error deleting item', 'error');
          this.loading = false;
        }
      });
    }
  }

  saveItem(): void {
    if (this.editingId) {
      this.updateItem();
    } else {
      this.createItem();
    }
  }

  // ==================== HELPERS ====================
  setDefaultDates(): void {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = lastWeek.toISOString().split('T')[0];
    this.weekStart = lastWeek.toISOString().split('T')[0];
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getTotalValue(): number {
    return this.inventoryItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }

  getTotalQuantity(): number {
    return this.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  }
}