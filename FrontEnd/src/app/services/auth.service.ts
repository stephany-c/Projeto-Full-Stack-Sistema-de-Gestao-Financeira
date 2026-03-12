import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

import { LoginResponse } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    currentUser = signal<LoginResponse | null>(null);

    constructor(private http: HttpClient) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUser.set(JSON.parse(savedUser));
        }
    }

    login(credentials: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(user => {
                localStorage.setItem('token', user.token);
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUser.set(user);
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData);
    }

    /**
     * "Acorda" o backend no Render (Cold Start).
     * Chamado no startup da aplicação para reduzir o delay no primeiro login.
     */
    ping(): Observable<any> {
        return this.http.get(`${environment.apiUrl}/public/health`);
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser.set(null);
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUserId(): number | null {
        const user = this.currentUser();
        return user?.userId || null;
    }
}
