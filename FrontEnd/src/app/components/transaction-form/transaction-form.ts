import { Component, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormGroupDirective } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
// ... (mantenha os outros imports)
import { CategoryService, Category } from '../../services/category.service';
import { TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
    selector: 'app-transaction-form',
    // ... (mantenha o restante)
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatButtonModule, MatIconModule, MatDatepickerModule
    ],
    templateUrl: './transaction-form.html',
    styleUrl: './transaction-form.scss'
})
export class TransactionFormComponent implements OnInit {
    @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
    @Output() transactionCreated = new EventEmitter<void>();
    // ... (mantenha as outras propriedades)
    transactionForm: FormGroup;
    transactionTypes = Object.values(TransactionType);
    categories = signal<Category[]>([]);
    loading = signal<boolean>(false);
    hasCategories = signal<boolean>(true);
    isEditing = signal<boolean>(false);
    transactionId: number | null = null;
    successMessage = signal<string | null>(null);

    isAddingCategory = signal<boolean>(false);
    newCategoryName = '';

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
            date: [new Date().toISOString().split('T')[0], Validators.required],
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

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditing.set(true);
                this.transactionId = +id;
                this.loadTransaction(this.transactionId);
            }
        });
    }

    // ... (pular loadCategories, loadTransaction, toggleQuickAdd, quickAddCategory)
    loadCategories(userId: number): void {
        console.log('📂 Loading categories for userId:', userId);
        this.loading.set(true);
        this.categoryService.getAll().subscribe({
            next: (data: Category[]) => {
                console.log('✅ Categories loaded:', data);
                this.categories.set(data);
                this.loading.set(false);
                this.hasCategories.set(data.length > 0);
                if (data.length > 0 && !this.isEditing()) {
                    this.transactionForm.patchValue({ categoryId: data[0].id });
                }
            },
            error: (err: any) => {
                console.error('❌ Error loading categories:', err);
                this.loading.set(false);
            }
        });
    }

    loadTransaction(id: number): void {
        this.loading.set(true);
        this.transactionService.getById(id).subscribe({
            next: (transaction: any) => {
                this.transactionForm.patchValue({
                    description: transaction.description,
                    amount: transaction.amount,
                    date: transaction.date,
                    type: transaction.type,
                    categoryId: transaction.categoryId
                });
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading transaction:', err);
                this.loading.set(false);
            }
        });
    }

    toggleQuickAdd(): void {
        this.isAddingCategory.set(!this.isAddingCategory());
        this.newCategoryName = '';
    }

    quickAddCategory(): void {
        if (!this.newCategoryName.trim()) return;

        this.loading.set(true);
        this.categoryService.create(this.newCategoryName).subscribe({
            next: (newCat) => {
                const userId = this.authService.getUserId();
                if (userId) {
                    this.loadCategories(userId); // Refresh list
                    this.transactionForm.patchValue({ categoryId: newCat.id });
                }
                this.toggleQuickAdd();
            },
            error: (err) => {
                console.error('Error adding category:', err);
                this.loading.set(false);
            }
        });
    }

    onSubmit(): void {
        if (this.transactionForm.valid) {
            const userId = this.authService.getUserId();
            if (!userId) {
                console.error('User not authenticated');
                return;
            }
            const formValue = { ...this.transactionForm.value, userId };

            if (this.isEditing() && this.transactionId) {
                this.transactionService.update(this.transactionId, formValue).subscribe({
                    next: () => {
                        this.router.navigate(['/transactions']);
                    },
                    error: (err) => console.error('Error updating:', err)
                });
            } else {
                this.transactionService.create(formValue).subscribe({
                    next: () => {
                        this.successMessage.set('Transação cadastrada!');
                        setTimeout(() => this.successMessage.set(null), 3000);

                        // Reset completo do formulário e do estado visual do Material
                        if (this.formDirective) {
                            this.formDirective.resetForm({
                                description: '',
                                amount: 0,
                                date: new Date().toISOString().split('T')[0],
                                type: TransactionType.EXPENSE,
                                categoryId: this.categories()[0]?.id,
                                userId
                            });
                        }

                        this.formattedAmount.set('');
                        this.transactionCreated.emit();
                    },
                    error: (err) => {
                        console.error('Error creating transaction:', err);
                    }
                });
            }
        }
    }
    formattedAmount = signal('');

    onAmountInput(event: any): void {
        const input = event.target;
        // Remove non-numeric characters
        let value = input.value.replace(/\D/g, '');

        if (!value) {
            this.transactionForm.patchValue({ amount: null });
            this.formattedAmount.set('');
            return;
        }

        // Convert to float (e.g. "1234" -> 12.34)
        const floatValue = parseFloat(value) / 100;

        // Update form control with numeric value
        this.transactionForm.patchValue({ amount: floatValue });

        // Format for display (e.g. "R$ 12,34")
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
