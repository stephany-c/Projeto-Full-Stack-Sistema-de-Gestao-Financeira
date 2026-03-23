import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

import { LoginResponse } from '../models/auth.model';

@Injectable({
    // 'root' significa que haverá apenas uma instância deste serviço em toda a aplicação (Singleton).
    // Qualquer componente que pedir este serviço vai receber a mesma instância, compartilhando os mesmos dados.
    providedIn: 'root'
})
export class AuthService {
    // Monta a URL base para as requisições de autenticação usando as variáveis de ambiente
    private apiUrl = `${environment.apiUrl}/auth`;

    // Signal: Uma variável "reativa" que guarda o estado do usuário logado atual.
    // Qualquer componente da interface pode "ouvir" essa variável e se atualizar automaticamente quando ela mudar.
    currentUser = signal<LoginResponse | null>(null);

    constructor(private http: HttpClient) {
        // Ao iniciar o serviço (ex: recarregar a página com F5), tenta buscar o usuário que estava salvo no navegador
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            // Se encontrar um usuário salvo, atualiza o Signal para recuperar a sessão sem ele precisar logar de novo
            this.currentUser.set(JSON.parse(savedUser));
        }
    }

    // Função responsável por enviar as credenciais (email/senha) para a API e fazer o login
    login(credentials: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            // O 'tap' serve para interceptar a resposta de sucesso antes dela chegar na tela que chamou a função.
            // Aqui usamos ele para salvar o token e os dados do usuário assim que o login dá certo no backend.
            tap(user => {
                localStorage.setItem('token', user.token); // Salva o token de acesso (a "chave" de entrada nas requisições)
                localStorage.setItem('user', JSON.stringify(user)); // Salva os dados do usuário (nome, id, etc)
                this.currentUser.set(user); // Atualiza o signal, avisando toda a aplicação que este usuário acabou de logar
            })
        );
    }

    // Envia os dados preenchidos na tela de cadastro de um novo usuário para o backend
    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    /**
     * "Acorda" o backend no Render (Cold Start).
     * Chamado no startup da interface para reduzir o delay no primeiro login.
     * Como backends em servidores gratuitos "dormem" após alguns minutos de inatividade, 
     * essa chamada leve faz com que o servidor acorde enquanto o usuário ainda está preenchendo as coisas.
     */
    ping(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/public/health`);
    }

    // Função de saída: Limpa todos os dados salvos e o estado em memória, efetuando o logoff
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser.set(null); // Esconde as telas/menus que dependem do usuário estar logado
    }

    // Verifica rapidamente se já existe um token salvo (retorna true se estiver "logado", false caso contrário)
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    // Apenas retorna o texto do token atual que está armazenado no localStorage
    getToken(): string | null {
        return localStorage.getItem('token');
    }

    // Função prática (helper) para pegar de forma rápida apenas o ID numérico do usuário que está logado
    getUserId(): number | null {
        const user = this.currentUser(); // "Lê" o valor atual que está dentro do signal
        return user?.userId || null;
    }
}
