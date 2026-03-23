import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { ptBR } from 'date-fns/locale';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

// Configuração principal da aplicação Angular
export const appConfig: ApplicationConfig = {
  // Lista de "provedores" (serviços e configurações globais) injetados na aplicação inteira
  providers: [
    provideBrowserGlobalErrorListeners(), // Captura erros não tratados de forma global
    provideRouter(routes), // Ativa as rotas da aplicação
    provideHttpClient(withInterceptors([authInterceptor])), // Ativa requisições HTTP e usa o interceptor de autenticação (injeta o token nas requisições)
    provideCharts(withDefaultRegisterables()), // Configura a biblioteca ng2-charts para permitir renderizar os gráficos no dashboard
    provideDateFnsAdapter(), // Configura o Angular Material para usar a biblioteca 'date-fns' no formatação de datas
    { provide: MAT_DATE_LOCALE, useValue: ptBR }, // Define o idioma padrão das datas para Português do Brasil (pt-BR)
    provideAnimationsAsync() // Ativa animações de forma assíncrona (muito usado e necessário pelo Angular Material)
  ]
};
