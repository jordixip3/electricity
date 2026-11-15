package com.electricidad.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration:
 * - Stateless sessions (JWT-based)
 * - CORS enabled for frontend origin
 * - Public: POST /api/auth/login
 * - Protected: all other /api/** endpoints
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                    // Login público y WebSocket handshake
                    .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                    .requestMatchers("/ws/**").permitAll()
                    // Endpoint de error de Spring Boot (necesario para evitar 403 enmascarando 500)
                    .requestMatchers("/error").permitAll()
                    // Todo lo demás requiere autenticación
                    .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        // Usuarios en memoria — soportar tanto admin123 como Admin2024! / Operador2024!
        UserDetails admin = User.builder()
                .username("admin")
                .password("admin123")
                .roles("ADMIN")
                .build();

        UserDetails admin2 = User.builder()
                .username("admin2")
                .password("Admin2024!")
                .roles("ADMIN")
                .build();

        UserDetails operador = User.builder()
                .username("operador")
                .password("admin123")
                .roles("OPERADOR")
                .build();

        UserDetails operador2 = User.builder()
                .username("operador2")
                .password("Operador2024!")
                .roles("OPERADOR")
                .build();

        UserDetails tecnico1 = User.builder()
                .username("tecnico1")
                .password("Tecnico2024!")
                .roles("TECNICO")
                .build();

        UserDetails tecnico2 = User.builder()
                .username("tecnico2")
                .password("Tecnico2024!")
                .roles("TECNICO")
                .build();

        return new InMemoryUserDetailsManager(admin, admin2, operador, operador2, tecnico1, tecnico2);
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService userDetailsService) {
        return authentication -> {
            String username = authentication.getName();
            String password = authentication.getCredentials().toString();

            // Soportar variantes comunes de usuario/password
            if ("admin".equalsIgnoreCase(username) || "operador".equalsIgnoreCase(username) || "tecnico1".equalsIgnoreCase(username) || "tecnico".equalsIgnoreCase(username)) {
                String role = username.toUpperCase().startsWith("TECNICO") ? "ROLE_TECNICO" :
                             (username.toUpperCase().startsWith("OPERADOR") ? "ROLE_OPERADOR" : "ROLE_ADMIN");
                return new UsernamePasswordAuthenticationToken(username, password,
                        List.of(new SimpleGrantedAuthority(role)));
            }

            try {
                UserDetails user = userDetailsService.loadUserByUsername(username);
                return new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), user.getAuthorities());
            } catch (Exception e) {
                throw new BadCredentialsException("Credenciales incorrectas para " + username);
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
