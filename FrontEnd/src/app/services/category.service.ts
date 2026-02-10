import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Category {
    id: number;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:8080/api/categories';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getAll(): Observable<Category[]> {
        const userId = this.authService.getUserId();
        if (!userId) return new Observable(observer => observer.error('User not authenticated'));

        console.log('🌐 CategoryService - Fetching categories for userId:', userId);
        return this.http.get<Category[]>(`${this.apiUrl}/user/${userId}`);
    }

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
