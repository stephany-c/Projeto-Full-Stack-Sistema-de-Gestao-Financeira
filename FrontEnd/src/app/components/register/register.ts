import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Criar Conta</h1>
        <p>Comece a controlar suas finanças hoje mesmo</p>
        
        <form (ngSubmit)="onRegister()" #registerForm="ngForm">
          <div class="form-group">
            <label>Nome Completo</label>
            <input type="text" [(ngModel)]="user.name" name="name" required placeholder="Seu nome">
          </div>
          
          <div class="form-group">
            <label>E-mail</label>
            <input type="email" [(ngModel)]="user.email" name="email" required email placeholder="seu@email.com">
          </div>
          
          <div class="form-group">
            <label>Senha</label>
            <input type="password" [(ngModel)]="user.password" name="password" required minlength="6" placeholder="Sua senha">
          </div>
          
          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <div *ngIf="successMessage" class="success-message">
            {{ successMessage }}
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="!registerForm.form.valid">Cadastrar</button>
        </form>
        
        <div class="auth-footer">
          Já tem uma conta? <a routerLink="/login">Entrar</a>
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
      background: #2ecc71;
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
    .success-message { color: #2ecc71; margin-bottom: 1rem; font-size: 0.9rem; }
  `]
})
export class RegisterComponent {
  user = { name: '', email: '', password: '' };
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        const backendMsg = err.error ? (typeof err.error === 'string' ? err.error : err.error.message) : null;
        this.errorMessage = backendMsg || 'Erro ao criar conta. Tente novamente.';
        console.error(err);
      }
    });
  }
}
