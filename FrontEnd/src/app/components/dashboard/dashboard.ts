import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective, MatCardModule, MatIconModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
    transactions = signal<Transaction[]>([]);
    totalIncome = signal(0);
    totalExpense = signal(0);
    balance = signal(0);
    monthlyResult = signal(0);

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

    constructor(private transactionService: TransactionService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        // Request large enough sample to cover current month charts
        this.transactionService.getTransactions(0, 1000).subscribe(response => {
            const data = response.content;
            this.transactions.set(data);
            this.calculateSummary(data);
        });
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

    calculateSummary(data: Transaction[]): void {
        let income = 0;
        let expense = 0;
        let mIncome = 0;
        let mExpense = 0;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const categoryMap = new Map<string, number>();

        data.forEach(t => {
            const tDate = new Date(t.date);
            const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

            if (t.type === TransactionType.INCOME) {
                income += t.amount;
                if (isCurrentMonth) mIncome += t.amount;
            } else {
                expense += t.amount;
                if (isCurrentMonth) {
                    mExpense += t.amount;
                    // Only sum categories for current month to match cards
                    const catName = t.categoryName || 'Outros';
                    categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
                }
            }
        });

        this.totalIncome.set(income);
        this.totalExpense.set(expense);
        this.balance.set(income - expense);
        this.monthlyResult.set(mIncome - mExpense);

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
}
