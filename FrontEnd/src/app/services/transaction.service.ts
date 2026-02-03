import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = 'http://localhost:8080/api/transactions';
    private userId = 1; // Mock user ID for demo

    constructor(private http: HttpClient) { }

    getAll(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${this.userId}`);
    }

    getByPeriod(startDate: string, endDate: string): Observable<Transaction[]> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<Transaction[]>(`${this.apiUrl}/user/${this.userId}/filter`, { params });
    }

    create(transaction: Transaction): Observable<Transaction> {
        const payload = { ...transaction, userId: this.userId };
        return this.http.post<Transaction>(this.apiUrl, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
