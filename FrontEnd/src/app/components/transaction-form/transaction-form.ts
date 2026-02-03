import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService, Category } from '../../services/category.service';
import { TransactionType } from '../../models/transaction.model';

@Component({
    selector: 'app-transaction-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './transaction-form.html',
    styleUrl: './transaction-form.scss'
})
export class TransactionFormComponent implements OnInit {
    @Output() transactionCreated = new EventEmitter<void>();
    transactionForm: FormGroup;
    transactionTypes = Object.values(TransactionType);
    categories = signal<Category[]>([]);

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService
    ) {
        this.transactionForm = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(3)]],
            amount: [0, [Validators.required, Validators.min(0.01)]],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            type: [TransactionType.EXPENSE, Validators.required],
            categoryId: [null, Validators.required],
            userId: [1] // Usuário padrão por enquanto
        });
    }

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoryService.getByUser(1).subscribe(data => {
            this.categories.set(data);
            if (data.length > 0) {
                this.transactionForm.patchValue({ categoryId: data[0].id });
            }
        });
    }

    onSubmit(): void {
        if (this.transactionForm.valid) {
            this.transactionService.create(this.transactionForm.value).subscribe(() => {
                this.transactionForm.reset({
                    description: '',
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    type: TransactionType.EXPENSE,
                    categoryId: this.categories()[0]?.id,
                    userId: 1
                });
                this.transactionCreated.emit();
            });
        }
    }
}
