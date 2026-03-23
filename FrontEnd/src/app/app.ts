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
/**
 * Componente principal da aplicação (O componente "Raiz").
 * Funciona como a carcaça estrutural principal onde outras telas serão desenhadas (no RouterOutlet).
 * Gerencia o layout global (barra lateral/sidebar), a responsividade (detectar modo celular), 
 * além do processo de warm-up (acordar o backend).
 */
export class App {
  // Signal reativo mantendo o título do app
  protected readonly title = signal('FinançaX');
  
  // Injeção de dependências (ao invés de declarar no constructor)
  authService = inject(AuthService);
  router = inject(Router);

  // Variáveis reativas (Signals) para controle da interface gráfica
  isSidebarOpen = signal(window.innerWidth > 768); // Por padrão, a sidebar só começa aberta se a tela for "grande" (Desktop)
  isMobile = signal(window.innerWidth <= 768); // Determina inicialmente se estamos ou não em um dispositivo móvel

  constructor() {
    // Escuta detecção de mudanças de URL da aplicação
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Se clicou num menu num celular, esconde a barra lateral (sidebar) automaticamente
      if (this.isMobile()) {
        this.isSidebarOpen.set(false);
      }
    });

    // Dispara requisição "ping" no backend para acordar a hospedagem (útil no Render.com)
    // Se não fizesse isso, o usuário veria uma grande lentidão ao preencher o primeiro login do dia.
    this.authService.ping().subscribe({
      next: () => console.log('Backend "pre-warmed" com sucesso'),
      error: (err) => console.error('Erro ao tentar "pre-warm" o backend:', err)
    });
  }

  // "Ouvinte" atrelado à toda a janela de visualização do navegador (`HostListener`).
  // Toda vez que alguém diminui/aumenta a tela nos cantos, essa função dispara.
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const wasMobile = this.isMobile();
    // Reavalia o tamanho detectando se enquadra como formato dispositivo móvel
    this.isMobile.set(event.target.innerWidth <= 768);

    // Se houve mudança radical de layout (desktop para mobile ou vice-versa), ajusta a sidebar
    if (this.isMobile() !== wasMobile) {
      this.isSidebarOpen.set(!this.isMobile());
    }
  }

  // Função disparada no clique do botão que expande/recolhe a menu lateral
  toggleSidebar() {
    this.isSidebarOpen.update(val => !val); // Inverte seu valor atual true->false, false->true
  }

  // Disparado ao clicar na opção de sair no menu
  logout() {
    this.authService.logout(); // Limpa as credenciais locais
    this.router.navigate(['/login']); // Redireciona de volta p/ tela inicial
  }
}
