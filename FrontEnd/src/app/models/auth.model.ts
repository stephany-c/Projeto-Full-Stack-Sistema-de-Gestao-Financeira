// Interface que define o formato exato da resposta que o Back-End devolve 
// quando um usuário faz login com sucesso.
export interface LoginResponse {
    token: string; // O passe livre (JWT) usado para acessar rotas protegidas da API
    userId: number; // ID único numérico do usuário no banco de dados
    name: string; // Nome cadastrado do usuário
    email: string; // E-mail de acesso
}
