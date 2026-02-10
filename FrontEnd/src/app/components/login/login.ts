import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Entrar</h1>
        <p>Acesse sua conta para gerenciar suas finanças</p>
        
        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="credentials.email" name="email" required email placeholder="seu@email.com">
          </div>
          
          <div class="form-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="credentials.password" name="password" required placeholder="Sua senha">
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="!loginForm.form.valid">Entrar</button>
        </form>
        
        <div class="auth-footer">
          Não tem uma conta? <a routerLink="/register">Cadastre-se</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }
    .auth-card {
      background: white;
      padding: 2.5rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      width: 100%;
      max-width: 400px;
    }
    h1 { margin-bottom: 0.5rem; color: #333; }
    p { color: #666; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; color: #555; }
    input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    .btn-primary:disabled { background: #ccc; }
    .auth-footer { margin-top: 1.5rem; text-align: center; color: #777; }
    .error-message { color: #e74c3c; margin-bottom: 1rem; font-size: 0.9rem; }
  `]
})
export class LoginComponent {
    credentials = { email: '', password: '' };
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    onLogin() {
        this.authService.login(this.credentials).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.errorMessage = 'E-mail ou senha incorretos.';
                console.error(err);
            }
        });
    }
}
