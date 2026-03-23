import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

/**
 * Serviço de Categorias (CategoryService)
 * Centraliza e gerencia todas as operações de CRUD (Criar, Ler, Atualizar, Deletar) para as Categorias.
 * É este serviço que se comunica diretamente com a API do Back-End.
 */
@Injectable({
    providedIn: 'root' // Disponibiliza uma única instância do serviço para toda a aplicação
})
export class CategoryService {
    // Monta a URL base para as requisições de categoria pegando o endereço da API configurado no environment
    private apiUrl = `${environment.apiUrl}/categories`;

    // Injeta as ferramentas necessárias: HttpClient (para fazer as requisições) e AuthService (para pegar os dados do usuário ativo)
    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Busca no banco de dados todas as categorias que pertencem especificamente ao usuário que está logado.
     */
    getAll(): Observable<Category[]> {
        const userId = this.authService.getUserId(); // Pega o ID numérico do usuário
        if (!userId) return new Observable(observer => observer.error('User not authenticated')); // Trava se não tiver ID

        console.log('CategoryService - Fetching categories for userId:', userId);
        // Faz a requisição HTTP GET para a rota /categories/user/{id} e espera receber uma Lista de Categorias Observable<Category[]>
        return this.http.get<Category[]>(`${this.apiUrl}/user/${userId}`);
    }

    /**
     * Cria uma nova categoria, já amarrando ela automaticamente ao usuário logado.
     */
    create(name: string): Observable<Category> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const body = { name }; // Monta o JSON (corpo da requisição) enviando apenas o nome
        // POST = Criar na rota apropriada
        return this.http.post<Category>(`${this.apiUrl}/user/${userId}`, body);
    }

    /**
     * Atualiza o nome de uma categoria existente, garantindo que ela pertence ao usuário certo.
     */
    update(id: number, name: string): Observable<Category> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const body = { name };
        // PUT = Manda sobrepor/atualizar o registro existente
        return this.http.put<Category>(`${this.apiUrl}/${id}/user/${userId}`, body);
    }

    /**
     * Remove uma categoria do banco de dados. 
     * Tem a inteligência de perguntar pro banco: "E as transações que estavam nessa categoria deletada?". 
     * Se o usuário escolher recuperar, ele passa um ID de destino (transferToId) e o banco realoca as transações em vez de deixá-las órfãs.
     */
    delete(id: number, transferToId?: number): Observable<void> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        
        let params = new HttpParams();
        // Adiciona um parâmetro extra na URL se uma categoria de destino foi escolhida: ?transferTo=10
        if (transferToId) {
            params = params.set('transferTo', transferToId.toString());
        }
        
        // DELETE = Manda o comando de exclusão (passando ID da categoria, ID do dono e a instrução opcional de transferência)
        return this.http.delete<void>(`${this.apiUrl}/${id}/user/${userId}`, { params });
    }
}
