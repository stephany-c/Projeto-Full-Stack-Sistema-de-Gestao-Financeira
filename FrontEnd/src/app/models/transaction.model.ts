// Enumerador: Trava os valores permitidos para o tipo de transação. 
// Evita erros de digitação, obrigando o uso exato de 'INCOME' ou 'EXPENSE'.
export enum TransactionType {
    INCOME = 'INCOME', // Receita / Entrada de dinheiro
    EXPENSE = 'EXPENSE' // Despesa / Saída de dinheiro
}

// Interface que define os dados exatos que formam uma Transação
export interface Transaction {
    id?: number; // Opcional (?), pois quando o usuário cria a transação ela ainda não tem ID até ser salva no banco
    description: string; // Título ou justificativa da transação (ex: "Conta de Luz")
    amount: number; // Valor monetário (ex: 150.50)
    date: string; // Data em que a transação ocorreu (salvo como texto padrão ISO/Universal)
    type: TransactionType; // Define se é receita ou despesa usando o Enum acima
    categoryId?: number; // Opcional: ID da categoria atrelada à transação (pode vir nulo em algumas rotas)
    categoryName: string; // Define o nome da categoria apenas para exibição rápida na tabela
}

// Interface Genérica <T>: Representa o formato "Envelope" que o Spring Boot (Backend) 
// usa para devolver listas paginadas (tabelas divididas em páginas para não sobrecarregar as telas).
export interface PaginatedResponse<T> {
    content: T[]; // A lista real dos itens da página atual (se for <Transaction>, é uma lista de objetos transação)
    totalElements: number; // Quantidade absoluta de itens salvos no banco
    totalPages: number; // Quantas páginas no total o banco conseguiu calcular (ex: 5 páginas)
    size: number; // Tamanho máximo configurado por página (ex: 10 itens por vez)
    number: number; // Índice/Número da página atual que o usuário está vendo (geralmente começa contando do zero)
}
