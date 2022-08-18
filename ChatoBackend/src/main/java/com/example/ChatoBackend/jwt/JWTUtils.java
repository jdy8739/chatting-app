package com.example.ChatoBackend.jwt;

import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JWTUtils {

    private final String SECRET_KEY = "secret_key";

    private final String BEARER = "Bearer ";

    public Claims parseJwtToken(String authorizationHeader) {
        validateAuthorizationHeader(authorizationHeader);
        String token = extractToken(authorizationHeader);
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    private void validateAuthorizationHeader(String header) {
        if (header == null || !header.startsWith(BEARER)) {
            throw new IllegalArgumentException();
        }
    }

    public String extractToken(String authorizationHeader) {
        return authorizationHeader.substring(BEARER.length());
    }

    public String makeJWT(String id) {
        Date now = new Date();
        return Jwts.builder()
                .setHeaderParam(Header.TYPE, Header.JWT_TYPE)
                .setIssuer("fresh")
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + Duration.ofMinutes(1).toMillis()))
                .claim("id", id)
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String createRefreshToken() {
        Date now = new Date();
        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + Duration.ofMinutes(180).toMillis()))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public Claims filterInternal(String token) {
        return parseJwtToken(token);
    }

    public String getUserId(String authHeader) throws IllegalArgumentException {
        if (authHeader == null || authHeader.equals("Bearer")) return null;
        else return (String) filterInternal(authHeader).get("id");
    }

    public boolean checkIfIsValidRefreshToken(String refreshToken) throws ExpiredJwtException {
        Claims claims = filterInternal(refreshToken);
        Date now = java.sql.Timestamp.valueOf(LocalDateTime.now());
        return (now.before(claims.getExpiration()));
    }

    public String getUserIdFromExpiredToken(String authHeader) throws IllegalArgumentException {
        if (authHeader == null || authHeader.equals("Bearer")) return null;
        else return (String) getClaimsFromExpiredToken(authHeader).get("id");
    }

    public Claims getClaimsFromExpiredToken(String authorizationHeader) {
        try {
            validateAuthorizationHeader(authorizationHeader);
            String token = extractToken(authorizationHeader);
            return Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            return e.getClaims();
        }
    }
}
