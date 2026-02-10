import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService, Category } from '../../services/category.service';
import { TransactionType } from '../../models/transaction.model';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-transaction-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl: './transaction-form.html',
    styleUrl: './transaction-form.scss'
})
export class TransactionFormComponent implements OnInit {
    @Output() transactionCreated = new EventEmitter<void>();
    transactionForm: FormGroup;
    transactionTypes = Object.values(TransactionType);
    categories = signal<Category[]>([]);
    loading = signal<boolean>(false);
    hasCategories = signal<boolean>(true);

    isAddingCategory = signal<boolean>(false);
    newCategoryName = '';

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService
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
            console.log('🔍 TransactionForm - ngOnInit - userId:', userId);
            this.transactionForm.patchValue({ userId });
            this.loadCategories(userId);
        }
    }

    loadCategories(userId: number): void {
        console.log('📂 Loading categories for userId:', userId);
        this.loading.set(true);
        this.categoryService.getAll().subscribe({
            next: (data: Category[]) => {
                console.log('✅ Categories loaded:', data);
                this.categories.set(data);
                this.loading.set(false);
                this.hasCategories.set(data.length > 0);
                if (data.length > 0) {
                    this.transactionForm.patchValue({ categoryId: data[0].id });
                } else {
                    console.warn('⚠️ No categories found for user:', userId);
                }
            },
            error: (err: any) => {
                console.error('❌ Error loading categories:', err);
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

            this.transactionService.create(formValue).subscribe({
                next: () => {
                    this.transactionForm.reset({
                        description: '',
                        amount: 0,
                        date: new Date().toISOString().split('T')[0],
                        type: TransactionType.EXPENSE,
                        categoryId: this.categories()[0]?.id,
                        userId
                    });
                    this.transactionCreated.emit();
                },
                error: (err) => {
                    console.error('Error creating transaction:', err);
                }
            });
        }
    }
}
