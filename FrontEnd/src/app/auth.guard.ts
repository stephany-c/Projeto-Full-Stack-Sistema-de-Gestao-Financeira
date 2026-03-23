import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './services/auth.service';

// O Guardião de Rotas (Router Guard): 
// Ele age como um "segurança" nas rotas protegidas (como as telas de sistema interno).
// O Angular chama esta função antes de carregar a tela, e espera um "Pode Passar" (True) ou "Pare" (False).
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService); // Pega a referência para as lógicas de sessão
    const router = inject(Router); // Pega a referência de navegação do app

    // Se o serviço verificar que temos um token válido (usuário fez login devidamente):
    if (authService.isAuthenticated()) {
        return true; // Permitimos a entrada na rota desejada.
    }

    // Caso contrário ou tenha expirado, ele te barra de ver a rota e te devolve compulsoriamente pra tela de Login.
    router.navigate(['/login']);
    return false;
};
