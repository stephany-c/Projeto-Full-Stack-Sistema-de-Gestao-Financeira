import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';
import { format } from 'date-fns';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog';

@Component({
    selector: 'app-transaction-list',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatPaginatorModule, MatDatepickerModule,
        MatCheckboxModule, MatDialogModule
    ],
    templateUrl: './transaction-list.html',
    styleUrl: './transaction-list.scss'
})
/**
 * Lista de transações com:
 * - filtros (data, tipo, categoria, busca)
 * - paginação via API
 * - seleção múltipla
 * - edição inline
 */
export class TransactionListComponent implements OnInit {

    private authService = inject(AuthService);

    // Dados
    allTransactions = signal<Transaction[]>([]); // Todas as transações carregadas
    transactions = signal<Transaction[]>([]); // Transações da página atual
    displayedTransactions = signal<Transaction[]>([]); // Transações exibidas após busca
    categories = signal<Category[]>([]);

    // Seleção (checkbox)
    selectedIds = signal<Set<number>>(new Set());

    // Paginação
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);
    totalPages = signal(0);

    // Filtros
    startDate = signal<any>('');
    endDate = signal<any>('');
    selectedCategoryId = signal('');
    selectedType = signal('');
    searchTerm = signal('');

    // Edição inline
    editingTransactionId = signal<number | null>(null);
    editData: any = {};

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.loadTransactions();
        this.loadCategories();
    }

    // ========================
    // DATA LOAD
    // ========================

    loadTransactions(): void {
        const start = this.startDate();
        const end = this.endDate();

        const startDateStr = start instanceof Date ? format(start, 'yyyy-MM-dd') : start;
        const endDateStr = end instanceof Date ? format(end, 'yyyy-MM-dd') : end;

        this.transactionService.getTransactions(
            this.currentPage(),
            this.pageSize(),
            this.selectedType() || undefined,
            this.selectedCategoryId() ? +this.selectedCategoryId() : undefined,
            startDateStr || undefined,
            endDateStr || undefined
        ).subscribe(response => {
            this.transactions.set(response.content);
            this.applySearchFilter();

            this.totalElements.set(response.totalElements);
            this.totalPages.set(response.totalPages);

            this.selectedIds.set(new Set());
        });

        // Carrega TODAS as transações com os mesmos filtros para busca global
        this.transactionService.getTransactions(
            0,
            5000, // PageSize grande para pegar tudo
            this.selectedType() || undefined,
            this.selectedCategoryId() ? +this.selectedCategoryId() : undefined,
            startDateStr || undefined,
            endDateStr || undefined
        ).subscribe(response => {
            this.allTransactions.set(response.content);
            this.applySearchFilter();
        });
    }

    loadCategories(): void {
        this.categoryService.getAll()
            .subscribe(data => this.categories.set(data));
    }

    // ========================
    // FILTROS
    // ========================

    applyFilter(): void {
        this.currentPage.set(0);
        this.loadTransactions();
    }

    applySearchFilter(): void {
        const term = (this.searchTerm() ?? '').trim().toLowerCase();

        if (!term) {
            // Sem termo de busca: mostra transações da página atual
            this.displayedTransactions.set(this.transactions());
            return;
        }

        // Com termo de busca: busca em TODAS as transações carregadas
        const filtered = this.allTransactions().filter(t => {
            const hay = [
                t.description,
                t.categoryName,
                t.type,
                String(t.amount),
                t.date
            ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

            return hay.includes(term);
        });

        this.displayedTransactions.set(filtered);
    }

    clearFilter(): void {
        this.startDate.set('');
        this.endDate.set('');
        this.selectedCategoryId.set('');
        this.selectedType.set('');
        this.searchTerm.set('');
        this.currentPage.set(0);

        this.loadTransactions();
    }

    // ========================
    // PAGINAÇÃO
    // ========================

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadTransactions();
    }

    onPageSizeChange(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(0);
        this.loadTransactions();
    }

    onMatPageChange(event: PageEvent): void {
        this.pageSize.set(event.pageSize);
        this.currentPage.set(event.pageIndex);
        this.loadTransactions();
    }

    // ========================
    // DELETE
    // ========================

    deleteTransaction(id?: number): void {
        if (!id) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Transação',
                message: 'Tem certeza que deseja excluir?',
                confirmText: 'Excluir',
                isDestructive: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.transactionService.delete(id)
                    .subscribe(() => this.loadTransactions());
            }
        });
    }

    deleteSelected(): void {
        const ids = Array.from(this.selectedIds());
        if (!ids.length) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Selecionados',
                message: `Excluir ${ids.length} transações?`,
                confirmText: 'Excluir tudo',
                isDestructive: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.transactionService.deleteMultiple(ids)
                    .subscribe(() => this.loadTransactions());
            }
        });
    }

    // ========================
    // SELECTION
    // ========================

    toggleSelection(id?: number): void {
        if (id === undefined) return;

        const current = new Set(this.selectedIds());

        current.has(id) ? current.delete(id) : current.add(id);

        this.selectedIds.set(current);
    }

    isAllSelected(): boolean {
        const trans = this.transactions();
        return trans.length > 0 && trans.every(t => t.id && this.selectedIds().has(t.id));
    }

    toggleAll(): void {
        if (this.isAllSelected()) {
            this.selectedIds.set(new Set());
        } else {
            const ids = this.transactions()
                .map(t => t.id)
                .filter((id): id is number => id !== undefined);

            this.selectedIds.set(new Set(ids));
        }
    }

    // ========================
    // EXPORT
    // ========================

    exportToExcel(): void {
        const start = this.startDate();
        const end = this.endDate();

        const startDateStr = start instanceof Date ? format(start, 'yyyy-MM-dd') : start;
        const endDateStr = end instanceof Date ? format(end, 'yyyy-MM-dd') : end;

        this.transactionService.exportTransactions(
            this.selectedType() || undefined,
            this.selectedCategoryId() ? +this.selectedCategoryId() : undefined,
            startDateStr || undefined,
            endDateStr || undefined
        ).subscribe(blob => {
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `transacoes_${Date.now()}.xlsx`;
            a.click();

            window.URL.revokeObjectURL(url);
        });
    }

    // ========================
    // INLINE EDIT
    // ========================

    startEdit(transaction: Transaction): void {
        if (!transaction.id) return;

        this.editingTransactionId.set(transaction.id);
        this.editData = { ...transaction };

        if (!this.editData.categoryId && this.editData.categoryName) {
            const found = this.categories()
                .find(c => c.name === this.editData.categoryName);

            if (found) this.editData.categoryId = found.id;
        }

        if (this.editData.date) {
            this.editData.date = this.editData.date.split('T')[0];
        }
    }

    saveEdit(): void {
        const id = this.editingTransactionId();

        if (id && this.editData) {
            this.transactionService.update(id, this.editData).subscribe({
                next: () => {
                    this.loadTransactions();
                    this.cancelEdit();
                },
                error: err => console.error('Update error:', err)
            });
        }
    }

    cancelEdit(): void {
        this.editingTransactionId.set(null);
        this.editData = {};
    }
}