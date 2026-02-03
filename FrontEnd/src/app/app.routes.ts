import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'transactions', component: TransactionListComponent },
    { path: 'add-transaction', component: TransactionFormComponent }
];
