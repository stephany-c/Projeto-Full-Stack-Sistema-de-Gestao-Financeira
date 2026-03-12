import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { Category } from '../models/category.model';

/**
 * Serviço que gerencia as operações de CRUD para Categorias.
 * Inclui suporte para transferência de transações ao excluir uma categoria.
 */
@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = `${environment.apiUrl}/categories`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Recupera todas as categorias vinculadas ao usuário atual.
     */
    getAll(): Observable<Category[]> {
        const userId = this.authService.getUserId();
        if (!userId) return new Observable(observer => observer.error('User not authenticated'));

        console.log('CategoryService - Fetching categories for userId:', userId);
        return this.http.get<Category[]>(`${this.apiUrl}/user/${userId}`);
    }

    /**
     * Cria uma nova categoria para o usuário autenticado.
     */
    create(name: string): Observable<Category> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const body = { name };
        return this.http.post<Category>(`${this.apiUrl}/user/${userId}`, body);
    }

    update(id: number, name: string): Observable<Category> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        const body = { name };
        return this.http.put<Category>(`${this.apiUrl}/${id}/user/${userId}`, body);
    }

    /**
     * Remove uma categoria. Opcionalmente move as transações existentes para outra categoria.
     * @param id ID da categoria a ser excluída.
     * @param transferToId (Opcional) ID da categoria destino para as transações.
     */
    delete(id: number, transferToId?: number): Observable<void> {
        const userId = this.authService.getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        let params = new HttpParams();
        if (transferToId) {
            params = params.set('transferTo', transferToId.toString());
        }
        return this.http.delete<void>(`${this.apiUrl}/${id}/user/${userId}`, { params });
    }
}


