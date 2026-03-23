// Molde que define do que é feita uma Categoria dentro do sistema Front-End
export interface Category {
    id: number; // Identificador único da categoria (vindo do banco de dados)
    name: string; // Nome da categoria em si (ex: "Alimentação", "Salário", "Lazer")
}
