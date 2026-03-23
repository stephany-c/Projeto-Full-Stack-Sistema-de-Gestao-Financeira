import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, PaginatedResponse } from '../models/transaction.model';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Serviço de Transações (TransactionService)
 * O motor principal financeiro do sistema. Responsável pela comunicação com os endpoints da API de Transações no Back-End.
 * Ele gerencia a busca paginada, filtros avançados, além das ações básicas de criação, atualização e exclusão.
 */
@Injectable({
    providedIn: 'root'
})
export class TransactionService {
    private apiUrl = `${environment.apiUrl}/transactions`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Função avançada: Busca as transações do usuário logado suportando "páginas" e vários filtros dinâmicos de uma só vez.
     * Ela monta uma requisição cheia de parâmetros na URL (Query Params). Ex: /transactions/user/5?page=0&size=10&type=INCOME
     * 
     * @param page Número da página atual (ex: 0 é a primeira página).
     * @param size Quantidade de registros por tela solicitada (ex: 10 linhas na tabela).
     * @param type (Opcional) Busca somente INCOME ou EXPENSE.
     * @param categoryId (Opcional) Traz transações restritas a esta categoria apenas.
     * @param startDate Filtro de data inicial para delimitar o tempo.
     * @param endDate Filtro de data final.
     */
    getTransactions(
        page: number = 0,
        size: number = 10,
        type?: string,
        categoryId?: number,
        startDate?: string,
        endDate?: string
    ): Observable<PaginatedResponse<Transaction>> {
        const userId = this.authService.getUserId(); // Trava a visualização para os dados dono autenticado
        if (!userId) throw new Error('User not authenticated');

        // Cria a base dos parâmetros obrigatórios que viajam na URL
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        // Anexa filtros adicionais APENAS se o usuário preencheu/selecionou eles na tela
        if (type) params = params.set('type', type);
        if (categoryId) params = params.set('categoryId', categoryId.toString());
        if (startDate) params = params.set('startDate', startDate);
        if (endDate) params = params.set('endDate', endDate);

        // Dispara a requisição GET aguardando um "envelope" PaginatedResponse que vimos no arquivo de Models.
        return this.http.get<PaginatedResponse<Transaction>>(`${this.apiUrl}/user/${userId}`, { params });
    }

    /**
     * Exporta os dados filtrados das transações do usuário para um arquivo visual (Geralmente Excel).
     * O grande truque aqui é usar o 'responseType: blob', avisando o HttpClient que o retorno da API
     * não é um texto legível, mas sim um formato binário de arquivo (Blob).
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
            responseType: 'blob' // Fundamental para não corromper o arquivo binário na hora de decodificar e baixar
        });
    }

    /**
     * Salva (Registra) uma nova transação no sistema, embutindo e amarrando secretamente o ID do usuário logado debaixo dos panos.
     */
    create(transaction: Transaction): Observable<Transaction> {
        const userId = this.authService.getUserId();
        if (!userId) throw new Error('User not authenticated');
        // Usamos spread notation (...transaction) para pegar os campos digitados na tela e fundir com um objeto novo garantindo o 'userId' na força
        const payload = { ...transaction, userId };
        return this.http.post<Transaction>(this.apiUrl, payload);
    }

    // Busca os dados minuciosos de uma única transação usando seu ID numérico rastreador.
    getById(id: number): Observable<Transaction> {
        return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
    }

    // Envia novos dados por cima de uma transação preexistente (como retificar valor errado, ou mudar de categoria)
    update(id: number, transaction: any): Observable<Transaction> {
        return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction);
    }

    /**
     * Envia para a exclusão permanente MÚLTIPLAS transações ao mesmo tempo.
     * Recebe um array (lista grossa) de IDs numéricos resultantes dos quadradinhos (checkbox) marcados na tabela da tela.
     */
    deleteMultiple(ids: (number | undefined)[]): Observable<void> {
        // Limpa a lista engessada, removendo IDs inválidos (undefined) para evitar mandar tranqueira pro backend processar.
        const validIds = ids.filter(id => id !== undefined);
        return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: validIds }); // Envia na rota em lote (/bulk) despachando a listagem de IDs no corpo.
    }

    /**
     * Remove compulsoriamente apenas uma transação através de seu ID identificatório.
     */
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
