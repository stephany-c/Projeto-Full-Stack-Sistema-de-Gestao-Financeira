import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { TransactionFormComponent } from './components/transaction-form/transaction-form';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { CategoryManagerComponent } from './components/category-manager/category-manager';
import { authGuard } from './auth.guard';

// Define todas as rotas (URLs) da aplicação e quais telas elas devem abrir
export const routes: Routes = [
    { path: 'login', component: LoginComponent }, // Tela de login (aberta, sem proteção)
    { path: 'register', component: RegisterComponent }, // Tela de cadastro (aberta, sem proteção)
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }, // Tela principal protegida pelo authGuard (só acessa logado)
    { path: 'transactions', component: TransactionListComponent, canActivate: [authGuard] }, // Tabela de transações protegida
    { path: 'add-transaction', component: TransactionFormComponent, canActivate: [authGuard] }, // Formulário protegido
    { path: 'categories', component: CategoryManagerComponent, canActivate: [authGuard] }, // Gerenciador de categorias protegido
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' } // Rota padrão (raiz): se o usuário acessar '/', redireciona pro '/dashboard'
];
