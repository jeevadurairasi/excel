import { Routes } from '@angular/router';
import { App } from './app';
import { InventoryComponent } from './inventory/inventory.component';
import { WorkHoursComponent } from './work-hours/work-hours.component';
import { SpreadsheetComponent } from './spreadsheet/spreadsheet.component';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'inventory', component: InventoryComponent },
  { path: 'work-hours', component: WorkHoursComponent },
  { path: 'spreadsheet', component: SpreadsheetComponent }
];