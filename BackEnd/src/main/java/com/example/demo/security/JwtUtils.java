package com.example.demo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Componente utilitário para gerenciamento de JSON Web Tokens (JWT).
 * Responsável por gerar, validar e extrair informações dos tokens de
 * autenticação.
 */
@Component
public class JwtUtils {

    @Value("${app.jwtSecret:9a67475d-f151-4089-8a39-9d04961d15c8-9a67475d-f151-4089-8a39-9d04961d15c8}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    /**
     * Gera um token JWT para um usuário autenticado.
     * 
     * @param authentication Objeto de autenticação contendo detalhes do usuário.
     * @return String contendo o token JWT gerado.
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extrai o nome de usuário (subject) de um token JWT.
     * 
     * @param token Token JWT.
     * @return Nome de usuário contido no token.
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Valida a integridade e expiração de um token JWT.
     * 
     * @param authToken Token a ser validado.
     * @return true se o token for válido, false caso contrário.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
