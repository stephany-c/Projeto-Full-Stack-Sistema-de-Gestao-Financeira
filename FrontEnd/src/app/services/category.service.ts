import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
    id: number;
    name: string;
    icon: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = 'http://localhost:8080/api/categories';

    constructor(private http: HttpClient) { }

    getByUser(userId: number): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.apiUrl}/user/${userId}`);
    }

    create(name: string, icon: string, userId: number): Observable<Category> {
        const params = { name, icon, userId: userId.toString() };
        return this.http.post<Category>(this.apiUrl, null, { params });
    }
}
