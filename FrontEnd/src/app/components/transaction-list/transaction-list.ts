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
 * Componente que exibe a listagem de transações.
 * Suporta filtragem avançada, paginação dinâmica e edição em linha (inline).
 */
export class TransactionListComponent implements OnInit {
    private authService = inject(AuthService);
    transactions = signal<Transaction[]>([]);
    categories = signal<Category[]>([]);

    selectedIds = signal<Set<number>>(new Set());

    // Pagination signals
    currentPage = signal(0);
    pageSize = signal(10);
    totalElements = signal(0);
    totalPages = signal(0);

    startDate = signal<any>('');
    endDate = signal<any>('');
    selectedCategoryId = signal('');
    selectedType = signal('');
    searchTerm = signal('');

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private router: Router,
        private dialog: MatDialog
    ) { }


    ngOnInit(): void {
        this.loadTransactions();
        this.loadCategories();
    }

    /**
     * Carrega as transações do servidor aplicando os filtros de busca e paginação atuais.
     */
    loadTransactions(): void {
        const start = this.startDate();
        const end = this.endDate();

        // Convert Date objects to YYYY-MM-DD if they are Dates (from range picker)
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
            this.totalElements.set(response.totalElements);
            this.totalPages.set(response.totalPages);
            this.selectedIds.set(new Set()); // Limpa seleção ao mudar página/filtros
        });
    }

    loadCategories(): void {
        this.categoryService.getAll().subscribe(data => this.categories.set(data));
    }

    /**
     * Reseta a página para 0 e recarrega os dados após alteração de filtros.
     */
    applyFilter(): void {
        this.currentPage.set(0);
        this.loadTransactions();
    }

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

    clearFilter(): void {
        this.startDate.set('');
        this.endDate.set('');
        this.selectedCategoryId.set('');
        this.selectedType.set('');
        this.searchTerm.set('');
        this.currentPage.set(0);
        this.loadTransactions();
    }

    deleteTransaction(id: number | undefined): void {
        if (!id) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Transação',
                message: 'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
                confirmText: 'Excluir',
                isDestructive: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.transactionService.delete(id).subscribe(() => {
                    this.loadTransactions();
                });
            }
        });
    }

    toggleSelection(id: number | undefined): void {
        if (id === undefined) return;
        const current = new Set(this.selectedIds());
        if (current.has(id)) {
            current.delete(id);
        } else {
            current.add(id);
        }
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
            const allIds = this.transactions()
                .map(t => t.id)
                .filter((id): id is number => id !== undefined);
            this.selectedIds.set(new Set(allIds));
        }
    }

    deleteSelected(): void {
        const ids = Array.from(this.selectedIds());
        if (ids.length === 0) return;

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Excluir Selecionados',
                message: `Tem certeza que deseja excluir as ${ids.length} transações selecionadas?`,
                confirmText: 'Excluir Tudo',
                isDestructive: true
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.transactionService.deleteMultiple(ids).subscribe(() => {
                    this.loadTransactions();
                });
            }
        });
    }

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
            a.download = `transacoes_${new Date().getTime()}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }

    editingTransactionId = signal<number | null>(null);
    editData: any = {};

    /**
     * Ativa o modo de edição inline para uma transação específica.
     * Preenche o objeto temporário editData com os dados atuais da linha.
     */
    startEdit(transaction: Transaction): void {
        if (!transaction.id) return;
        this.editingTransactionId.set(transaction.id);
        this.editData = { ...transaction };

        // Fallback: If categoryId is missing but categoryName exists, try to find the ID
        if (!this.editData.categoryId && this.editData.categoryName) {
            const foundCat = this.categories().find(c => c.name === this.editData.categoryName);
            if (foundCat) {
                this.editData.categoryId = foundCat.id;
            }
        }

        // Ensure date is in YYYY-MM-DD format for input
        if (this.editData.date) {
            this.editData.date = this.editData.date.split('T')[0];
        }
    }

    /**
     * Envia as alterações da edição inline para o servidor.
     */
    saveEdit(): void {
        const id = this.editingTransactionId();
        if (id && this.editData) {
            this.transactionService.update(id, this.editData).subscribe({
                next: (updated) => {
                    this.loadTransactions(); // Refresh to ensure data consistency
                    this.cancelEdit();
                },
                error: (err) => console.error('Error updating transaction:', err)
            });
        }
    }

    cancelEdit(): void {
        this.editingTransactionId.set(null);
        this.editData = {};
    }
}
