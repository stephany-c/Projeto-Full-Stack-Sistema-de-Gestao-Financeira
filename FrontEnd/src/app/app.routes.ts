import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { CategoryManagerComponent } from './components/category-manager/category-manager';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'transactions', component: TransactionListComponent, canActivate: [authGuard] },
    { path: 'add-transaction', component: TransactionFormComponent, canActivate: [authGuard] },
    { path: 'categories', component: CategoryManagerComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
