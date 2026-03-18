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
export class DashboardComponent implements OnInit {
    transactions = signal<Transaction[]>([]);
    totalIncome = signal(0);
    totalExpense = signal(0);
    balance = signal(0);
    monthlyResult = signal(0);

    selectedMonth = signal<number>(new Date().getMonth());
    selectedYear = signal<number>(new Date().getFullYear());

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

    public pieChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'right',
            }
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
        scales: {
            y: { beginAtZero: true }
        },
        plugins: {
            legend: { position: 'top' }
        }
    };

    constructor(private transactionService: TransactionService) {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 3; y <= currentYear + 1; y++) {
            this.years.push(y);
        }
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const { startDate, endDate } = this.getPeriodDates();

        this.transactionService.getTransactions(0, 5000, undefined, undefined, startDate, endDate).subscribe(response => {
            const data = response.content;
            this.transactions.set(data);
            this.calculateSummary(data);
            this.calculateMonthlyTrend(data);
        });
    }

    /**
     * Calcula as datas de início e fim com base no ano e mês selecionados.
     */
    private getPeriodDates(): { startDate?: string, endDate?: string } {
        let start: Date;
        let end: Date;

        if (this.selectedMonth() === -1) {
            start = new Date(this.selectedYear(), 0, 1);
            end = new Date(this.selectedYear(), 11, 31, 23, 59, 59);
        } else if (this.selectedMonth() === -2) {
            // 1º Semestre: Jan a Jun
            start = new Date(this.selectedYear(), 0, 1);
            end = new Date(this.selectedYear(), 5, 30, 23, 59, 59);
        } else if (this.selectedMonth() === -3) {
            // 2º Semestre: Jul a Dez
            start = new Date(this.selectedYear(), 6, 1);
            end = new Date(this.selectedYear(), 11, 31, 23, 59, 59);
        } else {
            start = new Date(this.selectedYear(), this.selectedMonth(), 1);
            end = new Date(this.selectedYear(), this.selectedMonth() + 1, 0, 23, 59, 59);
        }

        return {
            startDate: format(start, 'yyyy-MM-dd'),
            endDate: format(end, 'yyyy-MM-dd')
        };
    }

    onMonthYearChange(): void {
        this.loadData();
    }

    private generateColors(count: number): string[] {
        const baseColors = ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#34495e', '#e74c3c', '#2ecc71'];
        if (count <= baseColors.length) return baseColors.slice(0, count);

        // Generate more colors if needed
        const colors = [...baseColors];
        for (let i = baseColors.length; i < count; i++) {
            const hue = (i * 137.5) % 360; // Golden angle for even distribution
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }

    /**
     * Calcula os totais e agrupa os dados de despesas por categoria para os gráficos.
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

        this.totalIncome.set(income);
        this.totalExpense.set(expense);
        this.balance.set(income - expense);
        this.monthlyResult.set(income - expense);

        this.pieChartData.set({
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2e7d32', '#c62828'],
                borderWidth: 0
            }]
        });

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

    private calculateMonthlyTrend(data: Transaction[]): void {
        const monthsMap = new Map<string, { income: number, expense: number }>();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // If "All Months" is selected, initialize all 12
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
            if (t.type === TransactionType.INCOME) {
                totals.income += t.amount;
            } else {
                totals.expense += t.amount;
            }
        });

        const sortedKeys = Array.from(monthsMap.keys()).sort((a, b) => {
            const [mA, yA] = a.split(' ');
            const [mB, yB] = b.split(' ');
            const dateA = new Date(parseInt(yA), monthNames.indexOf(mA));
            const dateB = new Date(parseInt(yB), monthNames.indexOf(mB));
            return dateA.getTime() - dateB.getTime();
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
