import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { format, parseISO } from 'date-fns';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, MatCardModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatOptionModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
/**
 * Dashboard financeiro: calcula totais e prepara dados para gráficos.
 */
export class DashboardComponent implements OnInit {

    // Estado principal
    transactions = signal<Transaction[]>([]);
    totalIncome = signal(0);
    totalExpense = signal(0);
    balance = signal(0);
    monthlyResult = signal(0);

    // Filtros de período
    selectedMonth = signal<number>(new Date().getMonth());
    selectedYear = signal<number>(new Date().getFullYear());

    // -1: todos | -2: 1º semestre | -3: 2º semestre
    months = [
        { value: -1, label: 'Todos os meses' },
        { value: 0, label: 'Janeiro' },
        { value: 1, label: 'Fevereiro' },
        { value: 2, label: 'Março' },
        { value: 3, label: 'Abril' },
        { value: 4, label: 'Maio' },
        { value: 5, label: 'Junho' },
        { value: 6, label: 'Julho' },
        { value: 7, label: 'Agosto' },
        { value: 8, label: 'Setembro' },
        { value: 9, label: 'Outubro' },
        { value: 10, label: 'Novembro' },
        { value: 11, label: 'Dezembro' },
        { value: -2, label: '1º Semestre' },
        { value: -3, label: '2º Semestre' }
    ];

    years: number[] = [];

    // Config gráfico pizza
    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: { display: true, position: 'right' }
        }
    };

    pieChartData = signal<ChartData<'pie', number[], string | string[]>>({
        labels: ['Receitas', 'Despesas'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#2e7d32', '#c62828'],
            hoverBackgroundColor: ['#4caf50', '#ef5350'],
            borderWidth: 0
        }]
    });

    categoryChartData = signal<ChartData<'doughnut', number[], string | string[]>>({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [],
            borderWidth: 0
        }]
    });

    trendChartData = signal<ChartData<'bar'>>({
        labels: [],
        datasets: [
            { data: [], label: 'Receitas', backgroundColor: '#2e7d32', borderRadius: 4 },
            { data: [], label: 'Despesas', backgroundColor: '#c62828', borderRadius: 4 }
        ]
    });

    public trendChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { position: 'top' } }
    };

    constructor(private transactionService: TransactionService) {
        // Gera lista de anos (passado + futuro próximo)
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 3; y <= currentYear + 1; y++) {
            this.years.push(y);
        }
    }

    ngOnInit(): void {
        this.loadData();
    }

    // Carrega dados conforme filtro
    loadData(): void {
        const { startDate, endDate } = this.getPeriodDates();

        this.transactionService
            .getTransactions(0, 5000, undefined, undefined, startDate, endDate)
            .subscribe(response => {
                const data = response.content;
                this.transactions.set(data);

                this.calculateSummary(data);
                this.calculateMonthlyTrend(data);
            });
    }

    /**
     * Retorna período (start/end) baseado no filtro selecionado.
     */
    private getPeriodDates(): { startDate?: string, endDate?: string } {
        let start: Date;
        let end: Date;

        if (this.selectedMonth() === -1) {
            start = new Date(this.selectedYear(), 0, 1);
            end = new Date(this.selectedYear(), 11, 31, 23, 59, 59);
        } else if (this.selectedMonth() === -2) {
            // 1º semestre
            start = new Date(this.selectedYear(), 0, 1);
            end = new Date(this.selectedYear(), 5, 30, 23, 59, 59);
        } else if (this.selectedMonth() === -3) {
            // 2º semestre
            start = new Date(this.selectedYear(), 6, 1);
            end = new Date(this.selectedYear(), 11, 31, 23, 59, 59);
        } else {
            // mês específico
            start = new Date(this.selectedYear(), this.selectedMonth(), 1);
            end = new Date(this.selectedYear(), this.selectedMonth() + 1, 0, 23, 59, 59);
        }

        return {
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd')
        };
    }

    // Disparado ao trocar mês/ano
    onMonthYearChange(): void {
        this.loadData();
    }

    // Gera cores extras para categorias
    private generateColors(count: number): string[] {
        const baseColors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#34495e', '#e74c3c', '#2ecc71'];
        if (count <= baseColors.length) return baseColors.slice(0, count);

        const colors = [...baseColors];
        for (let i = baseColors.length; i < count; i++) {
            const hue = (i * 137.5) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }

    /**
     * Calcula totais e agrupa despesas por categoria.
     */
    calculateSummary(data: Transaction[]): void {
        let income = 0;
        let expense = 0;
        const categoryMap = new Map<string, number>();

        data.forEach(t => {
            if (t.type === TransactionType.INCOME) {
                income += t.amount;
            } else {
                expense += t.amount;

                const catName = t.categoryName || 'Outros';
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
            }
        });

        // Atualiza cards
        this.totalIncome.set(income);
        this.totalExpense.set(expense);
        this.balance.set(income - expense);
        this.monthlyResult.set(income - expense);

        // Pizza (receita x despesa)
        this.pieChartData.set({
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2e7d32', '#c62828'],
                borderWidth: 0
            }]
        });

        // Rosca (categorias)
        const categories = Array.from(categoryMap.keys());
        this.categoryChartData.set({
            labels: categories,
            datasets: [{
                data: Array.from(categoryMap.values()),
                backgroundColor: this.generateColors(categories.length),
                borderWidth: 0
            }]
        });
    }

    /**
     * Monta série mensal (receitas vs despesas).
     */
    private calculateMonthlyTrend(data: Transaction[]): void {
        const monthsMap = new Map<string, { income: number, expense: number }>();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // Garante 12 meses no modo "todos"
        if (this.selectedMonth() === -1) {
            for (let i = 0; i < 12; i++) {
                const key = `${monthNames[i]} ${this.selectedYear()}`;
                monthsMap.set(key, { income: 0, expense: 0 });
            }
        }

        data.forEach(t => {
            const date = t.date ? parseISO(t.date) : new Date();
            const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

            if (!monthsMap.has(key)) {
                monthsMap.set(key, { income: 0, expense: 0 });
            }

            const totals = monthsMap.get(key)!;
            t.type === TransactionType.INCOME
                ? totals.income += t.amount
                : totals.expense += t.amount;
        });

        // Ordena cronologicamente
        const sortedKeys = Array.from(monthsMap.keys()).sort((a, b) => {
            const [mA, yA] = a.split(' ');
            const [mB, yB] = b.split(' ');
            return new Date(+yA, monthNames.indexOf(mA)).getTime()
                 - new Date(+yB, monthNames.indexOf(mB)).getTime();
        });

        this.trendChartData.set({
            labels: sortedKeys,
            datasets: [
                { data: sortedKeys.map(k => monthsMap.get(k)!.income), label: 'Receitas', backgroundColor: '#2e7d32', borderRadius: 4 },
                { data: sortedKeys.map(k => monthsMap.get(k)!.expense), label: 'Despesas', backgroundColor: '#c62828', borderRadius: 4 }
            ]
        });
    }
}