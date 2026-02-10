import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = 'http://localhost:8080/api/transactions';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAll(): Observable<Transaction[]> {
        const userId = this.authService.getUserId() || 1; // Fallback to user 1
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}`);
    }

    getByPeriod(startDate: string, endDate: string): Observable<Transaction[]> {
        const userId = this.authService.getUserId() || 1; // Fallback to user 1
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${userId}/filter`, { params });
    }

    create(transaction: Transaction): Observable<Transaction> {
        const userId = this.authService.getUserId() || 1; // Fallback to user 1
        const payload = { ...transaction, userId };
        return this.http.post<Transaction>(this.apiUrl, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
