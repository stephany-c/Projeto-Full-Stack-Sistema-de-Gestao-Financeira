import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAll(): Observable<Transaction[]> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
    }

    getByPeriod(startDate: string, endDate: string): Observable<Transaction[]> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}/filter`, { params });
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
