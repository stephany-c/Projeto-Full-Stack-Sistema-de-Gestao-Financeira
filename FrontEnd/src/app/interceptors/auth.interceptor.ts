import { HttpInterceptorFn } from '@angular/common/http';

// O Interceptor HTTP:
// Ele funciona como correio de intercepção no meio de todas as "conversas" entre o seu navegador(Front) e a API (Back).
// O seu foco é colocar a chave de autenticação (Token JWT) "escondida" automaticamente em cada pedido que vai pro Back-End.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Procura por algum token salvo no navegador
    const token = localStorage.getItem('token');

    if (token) {
        // Se houver, a gente tira uma "cópia" do request que tava sendo despachado e anexa nos cabeçalhos
        // (headers) a informação da Autorização no padrão esperado `Bearer TokenAleatorioDasCredenciais`
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        // Repassa essa cópia modificada e carimbada com sucesso pro backend aprovar e retornar dados de fato
        return next(cloned);
    }

    // Se não tivermos o token de usuário, não alteramos nada, enviamos a requisição normal
    // Se bater num endpoint protegido, o banco vai voltar a mensagem de erro padrão 403 Forbidden.
    return next(req);
};
