import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
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
    selectedPeriod = signal('month');

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

    constructor(private transactionService: TransactionService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        const { startDate, endDate } = this.getPeriodDates(this.selectedPeriod());

        // Request large enough sample
        this.transactionService.getTransactions(0, 1000, undefined, undefined, startDate, endDate).subscribe(response => {
            const data = response.content;
            this.transactions.set(data);
            this.calculateSummary(data);
            this.calculateMonthlyTrend(data);
        });
    }

    /**
     * Converte o período selecionado (ex: '7days', 'lastYear') em datas ISO reais.
     * Retorna um objeto vazio para 'All Time', disparando a busca sem filtros de data.
     */
    private getPeriodDates(period: string): { startDate?: string, endDate?: string } {
        const now = new Date();
        let start = new Date();

        if (period === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (period === '7days') {
            start.setDate(now.getDate() - 7);
        } else if (period === '30days') {
            start.setDate(now.getDate() - 30);
        } else if (period === '90days') {
            start.setDate(now.getDate() - 90);
        } else if (period === 'thisYear') {
            start = new Date(now.getFullYear(), 0, 1);
        } else if (period === 'lastYear') {
            const lastYear = now.getFullYear() - 1;
            start = new Date(lastYear, 0, 1);
            const end = new Date(lastYear, 11, 31);
            return {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0]
            };
        } else {
            return {}; // All time
        }

        return {
            startDate: start.toISOString().split('T')[0],
            endDate: now.toISOString().split('T')[0]
        };
    }

    onPeriodChange(period: string): void {
        this.selectedPeriod.set(period);
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
     * Filtra automaticamente para garantir que receitas (ex: Salário) não apareçam no gráfico de gastos.
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
                // Only sum expenses for category chart
                const catName = t.categoryName || 'Outros';
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
            }
        });

        this.totalIncome.set(income);
        this.totalExpense.set(expense);
        this.balance.set(income - expense); // This is still the "Total Balance" 
        this.monthlyResult.set(income - expense); // Now represents the "Result of the Period"

        // Update Pie Chart Signal
        this.pieChartData.set({
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2e7d32', '#c62828'],
                borderWidth: 0
            }]
        });

        // Update Category Chart Signal
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
     * Agrupa transações por mês para o gráfico de tendência.
     * Usa uma chave "Jan 2024" e ordena cronologicamente os resultados.
     */
    private calculateMonthlyTrend(data: Transaction[]): void {
        const monthsMap = new Map<string, { income: number, expense: number }>();
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        data.forEach(t => {
            const date = new Date(t.date);
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

        // Sort months chronologically (simplified for the last few entries)
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
