package com.example.person3.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {
        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
        this.expiration = expiration;
    }

    /**
     * Backward-compatible overload. New authentication code should pass userId
     * so the JWT filter does not need a database lookup on every request.
     */
    public String generateToken(String identifier, String role) {
        return generateToken(identifier, role, null);
    }

    public String generateToken(
            String identifier,
            String role,
            Long userId
    ) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        var builder = Jwts.builder()
                .subject(identifier)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry);

        if (userId != null) {
            builder.claim("userId", userId);
        }

        return builder
                .signWith(secretKey)
                .compact();
    }

    /** Parse once and reuse the Claims object during one request. */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(Claims claims) {
        Date expirationDate = claims.getExpiration();
        return expirationDate != null && expirationDate.after(new Date());
    }

    public String extractIdentifier(Claims claims) {
        return claims.getSubject();
    }

    public String extractRole(Claims claims) {
        return claims.get("role", String.class);
    }

    public Long extractUserId(Claims claims) {
        return claims.get("userId", Long.class);
    }

    public boolean isTokenValid(String token) {
        try {
            return isTokenValid(extractClaims(token));
        } catch (Exception e) {
            return false;
        }
    }
}
