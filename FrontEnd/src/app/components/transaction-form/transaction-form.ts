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
 * Componente central do formulário de criação e edição gráfica de transações financeiras.
 * Consome fortemente Angular Reactive Forms e inclui lógicas avançadas nativas de máscara monetária, 
 * além de permitir um cadastro "rápido" (Quick Add) de categorias sem precisar sair da tela.
 */
export class TransactionFormComponent implements OnInit {
    // Captura a diretiva do FormGroup do HTML para forçar resets profundos do Material Design
    @ViewChild(FormGroupDirective) formDirective!: FormGroupDirective;
    
    // Emite um aviso silencioso para componentes pais avisando que "uma nova transação foi criada"
    @Output() transactionCreated = new EventEmitter<void>();
    
    // O formulário reativo mestre
    transactionForm: FormGroup;
    
    // Enum extraido para popular Selects visualmente ("Receita", "Despesa")
    transactionTypes = Object.values(TransactionType);
    
    // Signals (Estado reativo moderno) controlando a tela
    categories = signal<Category[]>([]);
    loading = signal<boolean>(false); // Mostra spinner ou bloqueia botões temporariamente
    hasCategories = signal<boolean>(true); // Flag para avisar usuário que ele precisa de categorias antes de prosseguir
    isEditing = signal<boolean>(false); // Flag de Rota: Estamos na página de Editar ou de Criar?

    transactionId: number | null = null;
    successMessage = signal<string | null>(null);

    // Controles para o recurso híbrido de Quick Add de Categoria
    isAddingCategory = signal<boolean>(false);
    newCategoryName = '';

    constructor(
        private fb: FormBuilder,
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private route: ActivatedRoute, // Inspeciona a URL atual para caçar IDs
        private router: Router
    ) {
        // Inicializa as fundações e regras base do Formulário
        this.transactionForm = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(3)]],
            amount: [0, [Validators.required, Validators.min(0.01)]], // Zero não passa!
            date: [new Date(), Validators.required],
            type: [TransactionType.EXPENSE, Validators.required],
            categoryId: [null, Validators.required],
            userId: [null] // Injetado ocultamente via JWT Token extraído
        });
    }

    ngOnInit(): void {
        const userId = this.authService.getUserId();
        if (userId) {
            this.transactionForm.patchValue({ userId });
            this.loadCategories(userId); // Busca categorias liberadas para este usuário logado
        }

        // Fica de olho na URL de forma reativa. Se o path tiver um ID (ex: /transactions/edit/15), assume modo Edição.
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.isEditing.set(true);
                this.transactionId = +id;
                this.loadTransaction(this.transactionId); // Popula imediatamente a tela com os dados vindos do banco
            }
        });
    }

    // Busca tabela de categorias do Backend e salva no Signal principal para popular combobox/selects
    loadCategories(userId: number): void {
        console.log('Loading categories for userId:', userId);
        this.loading.set(true); // Trava reatividade com carregamento visual
        this.categoryService.getAll().subscribe({
            next: (data: Category[]) => {
                console.log('Categories loaded:', data);
                this.categories.set(data);
                this.loading.set(false);
                this.hasCategories.set(data.length > 0);
                
                // Se houver categorias cadastradas num formulário "novo", pré-seleciona a primeira para agilizar
                if (data.length > 0 && !this.isEditing()) {
                    this.transactionForm.patchValue({ categoryId: data[0].id });
                }
            },
            error: (err: any) => {
                console.error('Error loading categories:', err);
                this.loading.set(false);
            }
        });
    }

    // Usado em Modo Edição: Pega o ID de uma transação e enfia os dados dentro dos Inputs da página
    loadTransaction(id: number): void {
        this.loading.set(true);
        this.transactionService.getById(id).subscribe({
            next: (transaction: any) => {
                this.transactionForm.patchValue({
                    description: transaction.description,
                    amount: transaction.amount,
                    date: transaction.date ? parseISO(transaction.date) : new Date(), // Deserializa a Data vinda da API
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

    // Esconde/Exibe o mini-form flutuante de criar categoria rápida
    toggleQuickAdd(): void {
        this.isAddingCategory.set(!this.isAddingCategory());
        this.newCategoryName = '';
    }

    /**
     * Adiciona uma nova categoria via "Quick Add" sem sair da página do formulário de transação.
     * Facilita o fluxo de cadastro para categorias não existentes sem que o usuário perca tudo que já digitou.
     */
    quickAddCategory(): void {
        if (!this.newCategoryName.trim()) return;

        this.loading.set(true);
        this.categoryService.create(this.newCategoryName).subscribe({
            next: (newCat) => {
                const userId = this.authService.getUserId();
                if (userId) {
                    this.loadCategories(userId); // Recarrega a lista completa
                    this.transactionForm.patchValue({ categoryId: newCat.id }); // Auto-seleciona a categoria que acabou de ser criada
                }
                this.toggleQuickAdd(); // Fecha o mini-form
            },
            error: (err) => {
                console.error('Error adding category:', err);
                this.loading.set(false);
            }
        });
    }

    /**
     * Motor de colheita e envio. Submete os dados inseridos e sanitizados para rodar a requisição HTTP.
     * Diferencia internamente caso esteja editando (PUT) ou Criando (POST)
     */
    onSubmit(): void {
        if (this.transactionForm.valid) { // Regra dura: Se estiver inválido, desiste
            const userId = this.authService.getUserId();
            if (!userId) {
                console.error('User not authenticated');
                return;
            }
            const formValue = { ...this.transactionForm.value, userId }; // Desestrutura clonando os valores e injetando o dono
            
            // Corrige fusos-horários transformando a Data pura ISO para um formato aceitável (ex. "2024-11-20") na API
            if (formValue.date) {
                formValue.date = format(formValue.date, 'yyyy-MM-dd');
            }

            if (this.isEditing() && this.transactionId) {
                // Modo PUT
                this.transactionService.update(this.transactionId, formValue).subscribe({
                    next: () => {
                        this.router.navigate(['/transactions']); // Retorna à lista após sucesso
                    },
                    error: (err) => console.error('Error updating:', err)
                });
            } else {
                // Modo POST
                this.transactionService.create(formValue).subscribe({
                    next: () => {
                        this.successMessage.set('Transação cadastrada!');
                        setTimeout(() => this.successMessage.set(null), 3000);

                        // Reset massivo completo do formulário mantendo apenas configurações padrão
                        if (this.formDirective) {
                            this.formDirective.resetForm({
                                description: '',
                                amount: 0,
                                date: new Date(),
                                type: TransactionType.EXPENSE,
                                categoryId: this.categories()[0]?.id,
                                userId
                            });
                        }

                        this.formattedAmount.set('');
                        this.transactionCreated.emit(); // Comunica aos componentes próximos caso precisem atualizar dados
                    },
                    error: (err) => {
                        console.error('Error creating transaction:', err);
                    }
                });
            }
        }
    }

    // Variável puramente visual que renderiza "R$" no input numérico da tela
    formattedAmount = signal('');

    /**
     * Máscara monetária que converte entrada numérica bruta (ao longo do pressionar das teclas) para o formato R$ 0,00.
     * Atualiza simultaneamente o valor numérico puro under-the-hood no Form Control (12.34).
     */
    onAmountInput(event: any): void {
        const input = event.target;
        // Corta tudo que não for dígito limpo nativo
        let value = input.value.replace(/\D/g, '');

        // Se deletou tudo, limpa o state
        if (!value) {
            this.transactionForm.patchValue({ amount: null });
            this.formattedAmount.set('');
            return;
        }

        // Converte string dura para decimal. Ex: teclas "1234" = Float "12.34"
        const floatValue = parseFloat(value) / 100;

        // Injeta silenciosamente no Form pra que a API receba algo compatível
        this.transactionForm.patchValue({ amount: floatValue });

        // Formata nativa do browser para exibir elegantemente "R$ 12,34"
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(floatValue);

        this.formattedAmount.set(formatted);
        input.value = formatted; // Recíproca: Altera o texto renderizado
    }

    // Triga regras de validação visual caso o campo de "valor" perca o foco sem ser modificado.
    onAmountBlur(): void {
        this.transactionForm.get('amount')?.markAsTouched();
    }
}
