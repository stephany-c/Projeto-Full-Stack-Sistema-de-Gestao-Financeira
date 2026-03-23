import { HttpInterceptorFn } from '@angular/common/http';
/**
 * Interceptor que adiciona o token JWT nas requisições HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

    // Recupera token salvo
    const token = localStorage.getItem('token');

    // Se existir, adiciona no header Authorization
    if (token) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });

        return next(cloned);
    }

    // Caso não exista, segue requisição normal
    return next(req);
};