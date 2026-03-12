import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, PaginatedResponse } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';


/**
 * Serviço responsável pela comunicação com os endpoints de Transações.
 * Gerencia a busca paginada, criação, atualização e exclusão de registros financeiros.
 */
@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Busca transações do usuário logado com suporte a paginação e filtros dinâmicos.
     * @param page Número da página atual.
     * @param size Quantidade de registros por página.
     * @param type Tipo de transação (INCOME/EXPENSE).
     * @param categoryId ID da categoria para filtro.
     * @param startDate Filtro de data inicial (ISO).
     * @param endDate Filtro de data final (ISO).
     */
    getTransactions(
        page: number = 0,
        size: number = 10,
        type?: string,
        categoryId?: number,
        startDate?: string,
        endDate?: string
    ): Observable<PaginatedResponse<Transaction>> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');

        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (type) params = params.set('type', type);
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get<PaginatedResponse<Transaction>>(`${this.apiUrl}/user/${userId}`, { params });
    }

    /**
     * Exporta as transações do usuário logado para um arquivo Excel.
     */
    exportTransactions(
        type?: string,
        categoryId?: number,
        startDate?: string,
        endDate?: string
    ): Observable<Blob> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');

        let params = new HttpParams();
        if (type) params = params.set('type', type);
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        return this.http.get(`${this.apiUrl}/export/${userId}`, {
            params,
            responseType: 'blob'
        });
    }

    /**
     * Registra uma nova transação associando-a ao usuário autenticado.
     */
    create(transaction: Transaction): Observable<Transaction> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');
        const payload = { ...transaction, userId };
        return this.http.post<Transaction>(this.apiUrl, payload);
    }

    getById(id: number): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
    }

    update(id: number, transaction: any): Observable<Transaction> {
        return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
    }

    /**
     * Remove múltiplas transações de uma vez.
     */
    deleteMultiple(ids: (number | undefined)[]): Observable<void> {
        const validIds = ids.filter(id => id !== undefined);
        return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: validIds });
    }

    /**
     * Remove uma transação permanente pelo ID.
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
