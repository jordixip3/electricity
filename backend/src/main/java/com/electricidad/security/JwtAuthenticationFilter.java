package com.electricidad.security;

import org.springframework.stereotype.Component;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

/**
 * JWT filter that validates the token from the Authorization header and populates the Spring Security context.
 * The secret key is retrieved from application properties (app.jwt.secret). For simplicity it's hard‑coded
 * here; in production you would inject it via @Value.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String JWT_SECRET = "ElectricidadSecretKey2024XyZ!@#$%^&*()"; // matches app.jwt.secret

    private JWTVerifier verifier() {
        return JWT.require(Algorithm.HMAC256(JWT_SECRET)).build();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                DecodedJWT decoded = verifier().verify(token);
                String role = decoded.getClaim("role").asString();
                if (role != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            decoded.getSubject(), null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                // Invalid token – security context remains empty and request will be rejected later
            }
        }
        filterChain.doFilter(request, response);
    }
}
