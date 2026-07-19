package com.electricidad.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for generating and verifying JWT tokens.
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret:ElectricidadSecretKey2024XyZ!}")
    private String secret;

    @Value("${app.jwt.expiration-hours:24}")
    private long expirationHours;

    public String generateToken(String username, String role) {
        return JWT.create()
                .withSubject(username)
                .withClaim("role", role)
                .withIssuedAt(Instant.now())
                .withExpiresAt(Instant.now().plus(expirationHours, ChronoUnit.HOURS))
                .sign(Algorithm.HMAC256(secret));
    }

    public DecodedJWT verifyToken(String token) throws JWTVerificationException {
        return JWT.require(Algorithm.HMAC256(secret))
                .build()
                .verify(token);
    }

    public String extractUsername(String token) {
        return verifyToken(token).getSubject();
    }

    public String extractRole(String token) {
        return verifyToken(token).getClaim("role").asString();
    }
}
