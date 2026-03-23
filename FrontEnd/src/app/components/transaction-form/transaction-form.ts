import { Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormGroupDirective } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Category } from '../../models/category.model';
import { format, parseISO } from 'date-fns';

@Component({
    selector: 'app-transaction-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatDatepickerModule
    ],
    templateUrl: './transaction-form.html',
    styleUrl: './transaction-form.scss'
})
/**
 * Formulário de criação e edição de transações.
 */
export class TransactionFormComponent implements OnInit {

    @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
    @Output() transactionCreated = new EventEmitter<void>();

    // Formulário principal
    transactionForm: FormGroup;

    // Dados auxiliares
    transactionTypes = Object.values(TransactionType);
    categories = signal<Category[]>([]);

    // Estados
    loading = signal(false);
    hasCategories = signal(true);
    isEditing = signal(false);
    successMessage = signal<string | null>(null);

    // Controle de edição
    transactionId: number | null = null;

    // Quick add de categoria
    isAddingCategory = signal(false);
    newCategoryName = '';

    // Máscara de valor (R$)
    formattedAmount = signal('');

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.transactionForm = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(3)]],
            amount: [0, [Validators.required, Validators.min(0.01)]],
            date: [new Date(), Validators.required],
            type: [TransactionType.EXPENSE, Validators.required],
            categoryId: [null, Validators.required],
            userId: [null]
        });
    }

    ngOnInit(): void {
        const userId = this.authService.getUserId();

        if (userId) {
            this.transactionForm.patchValue({ userId });
            this.loadCategories(userId);
        }

        // Verifica se está em modo edição pela rota
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');

            if (id) {
                this.isEditing.set(true);
                this.transactionId = +id;
                this.loadTransaction(this.transactionId);
            }
        });
    }

    // ========================
    // CARREGAMENTO
    // ========================

    loadCategories(userId: number): void {
        this.loading.set(true);

        this.categoryService.getAll().subscribe({
            next: data => {
                this.categories.set(data);
                this.hasCategories.set(data.length > 0);
                this.loading.set(false);

                // Seleciona primeira categoria automaticamente (modo criação)
                if (data.length && !this.isEditing()) {
                    this.transactionForm.patchValue({ categoryId: data[0].id });
                }
            },
            error: () => this.loading.set(false)
        });
    }

    loadTransaction(id: number): void {
        this.loading.set(true);

        this.transactionService.getById(id).subscribe({
            next: t => {
                this.transactionForm.patchValue({
                    description: t.description,
                    amount: t.amount,
                    date: t.date ? parseISO(t.date) : new Date(),
                    type: t.type,
                    categoryId: t.categoryId
                });

                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }

    // ========================
    // QUICK ADD
    // ========================

    toggleQuickAdd(): void {
        this.isAddingCategory.set(!this.isAddingCategory());
        this.newCategoryName = '';
    }

    quickAddCategory(): void {
        if (!this.newCategoryName.trim()) return;

        this.loading.set(true);

        this.categoryService.create(this.newCategoryName).subscribe({
            next: newCat => {
                const userId = this.authService.getUserId();

                if (userId) {
                    this.loadCategories(userId);
                    this.transactionForm.patchValue({ categoryId: newCat.id });
                }

                this.toggleQuickAdd();
            },
            error: () => this.loading.set(false)
        });
    }

    // ========================
    // SUBMIT
    // ========================

    onSubmit(): void {
        if (this.transactionForm.invalid) return;

        const userId = this.authService.getUserId();
        if (!userId) return;

        const formValue = { ...this.transactionForm.value, userId };

        // Ajusta formato da data para API
        if (formValue.date) {
            formValue.date = format(formValue.date, 'yyyy-MM-dd');
        }

        if (this.isEditing() && this.transactionId) {
            this.transactionService.update(this.transactionId, formValue)
                .subscribe(() => this.router.navigate(['/transactions']));
        } else {
            this.transactionService.create(formValue).subscribe({
                next: () => {
                    this.successMessage.set('Transação cadastrada!');
                    setTimeout(() => this.successMessage.set(null), 3000);

                    // Reset do formulário
                    this.formDirective?.resetForm({
                        description: '',
                        amount: 0,
                        date: new Date(),
                        type: TransactionType.EXPENSE,
                        categoryId: this.categories()[0]?.id,
                        userId
                    });

                    this.formattedAmount.set('');
                    this.transactionCreated.emit();
                }
            });
        }
    }

    // ========================
    // MÁSCARA DE VALOR
    // ========================

    onAmountInput(event: any): void {
        const input = event.target;
        let value = input.value.replace(/\D/g, '');

        if (!value) {
            this.transactionForm.patchValue({ amount: null });
            this.formattedAmount.set('');
            return;
        }

        const floatValue = parseFloat(value) / 100;

        this.transactionForm.patchValue({ amount: floatValue });

        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(floatValue);

        this.formattedAmount.set(formatted);
        input.value = formatted;
    }

    onAmountBlur(): void {
        this.transactionForm.get('amount')?.markAsTouched();
    }
}