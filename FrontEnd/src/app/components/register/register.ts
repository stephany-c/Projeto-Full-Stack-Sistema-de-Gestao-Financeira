import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', confirmPassword: '' };
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordFocused = false;
  confirmPasswordFocused = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  togglePassword(event: Event) {
    event.preventDefault(); // Prevent blur from firing
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(event: Event) {
    event.preventDefault();
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister() {
    this.errorMessage = ''; // Clear previous errors
    this.successMessage = '';

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.authService.register(this.user).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.successMessage = 'Conta criada com sucesso! Redirecionando...';
          this.cdr.detectChanges();
        });
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.ngZone.run(() => {
          // Extract the backend message, handling string and object formats
          let backendMsg: string | null = null;

          if (err.error) {
            if (typeof err.error === 'string') {
              backendMsg = err.error;
            } else if (typeof err.error === 'object') {
              backendMsg = err.error.error || err.error.message || JSON.stringify(err.error);
            }
          }

          if (!backendMsg) {
            backendMsg = err.message || err.statusText || null;
          }

          // Translate specific backend messages
          if (backendMsg && backendMsg.includes('Email is already in use')) {
            this.errorMessage = 'Este e-mail já está em uso.';
          } else {
            this.errorMessage = backendMsg || 'Erro ao criar conta. Tente novamente.';
          }
          console.error('Registration error:', err);
          this.cdr.detectChanges();
        });
      }
    });
  }
}
