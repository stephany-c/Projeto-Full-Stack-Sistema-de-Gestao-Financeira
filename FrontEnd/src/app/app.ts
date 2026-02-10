import { Component, signal, inject, HostListener, effect } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('FinançaX');
  authService = inject(AuthService);
  router = inject(Router);

  isSidebarOpen = signal(window.innerWidth > 768);
  isMobile = signal(window.innerWidth <= 768);

  constructor() {
    // Escuta mudanças de rota para fechar sidebar no mobile
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.isMobile()) {
        this.isSidebarOpen.set(false);
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const wasMobile = this.isMobile();
    this.isMobile.set(event.target.innerWidth <= 768);

    // Se mudou de desktop para mobile ou vice-versa, ajusta a sidebar
    if (this.isMobile() !== wasMobile) {
      this.isSidebarOpen.set(!this.isMobile());
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(val => !val);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
