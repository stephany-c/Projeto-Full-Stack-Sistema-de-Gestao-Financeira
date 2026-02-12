export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export interface Transaction {
    id?: number;
    description: string;
    amount: number;
    date: string;
    type: TransactionType;
    categoryId?: number;
    categoryName: string;
}
