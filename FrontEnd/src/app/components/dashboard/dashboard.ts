import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, BaseChartDirective],
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

    public pieChartData: ChartData<'pie', number[], string | string[]> = {
        labels: ['Receitas', 'Despesas'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#2e7d32', '#c62828'],
            hoverBackgroundColor: ['#4caf50', '#ef5350'],
            borderWidth: 0
        }]
    };

    public categoryChartData: ChartData<'doughnut', number[], string | string[]> = {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#34495e'],
            borderWidth: 0
        }]
    };

    constructor(private transactionService: TransactionService) { }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.transactionService.getAll().subscribe(data => {
            this.transactions.set(data);
            this.calculateSummary(data);
        });
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
                if (isCurrentMonth) mExpense += t.amount;

                // Category summary for doughnut chart
                const catName = t.categoryName || 'Outros';
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + t.amount);
            }
        });

        this.totalIncome.set(income);
        this.totalExpense.set(expense);
        this.balance.set(income - expense);
        this.monthlyResult.set(mIncome - mExpense);

        // Update Pie Chart
        this.pieChartData = {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#2e7d32', '#c62828'],
                borderWidth: 0
            }]
        };

        // Update Category Chart
        this.categoryChartData = {
            labels: Array.from(categoryMap.keys()),
            datasets: [{
                data: Array.from(categoryMap.values()),
                backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#34495e'],
                borderWidth: 0
            }]
        };
    }
}
