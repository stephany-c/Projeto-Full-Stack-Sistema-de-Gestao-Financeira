import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient, private authService: AuthService) { }

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

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
