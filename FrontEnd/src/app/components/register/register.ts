import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  user = { name: '', email: '', password: '', confirmPassword: '' };
  errorMessage = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    this.errorMessage = ''; // Clear previous errors

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.authService.register(this.user).subscribe({
      next: () => {
        this.successMessage = 'Conta criada com sucesso! Redirecionando...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        // Handle backend error format: { error: "Message" } or { message: "Message" }
        const backendMsg = err.error ? (err.error.error || err.error.message || err.error) : null;

        // Translate specific backend messages if needed
        if (backendMsg && backendMsg.includes('Email is already in use')) {
          this.errorMessage = 'Este e-mail já está em uso.';
        } else {
          this.errorMessage = backendMsg || 'Erro ao criar conta. Tente novamente.';
        }
        console.error(err);
      }
    });
  }
}
