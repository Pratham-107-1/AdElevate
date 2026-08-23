package com.adelevate.securityConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Single global CORS config for every endpoint in this service.
    // Previously only AdController had @CrossOrigin, and Spring Security's
    // filter chain never called .cors(...) at all — meaning CORS wasn't
    // actually wired into the security layer, and endpoints like
    // /api/subscription-plans and /api/admin/locations had no CORS
    // handling whatsoever (browser blocked the response before JS saw it).
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // Vite dev server
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // ✅ Public endpoints
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/forgot-password/verify",
                    "/api/auth/reset-password",
                    "/api/ad-images/**",
                    "/ad-images/**",
                    "/api/locations",
                    "/v3/api-docs/**",
                    "/swagger-ui/**",
                    "/swagger-ui.html"
                ).permitAll()

                // ✅ Admin-only ad moderation (must come before the general /api/ads/** permitAll rule below,
                // since Spring Security uses the first matching rule)
                .requestMatchers(HttpMethod.POST, "/api/ads/*/ratings").hasRole("CUSTOMER")
                .requestMatchers(HttpMethod.PUT, "/api/ads/*/approve", "/api/ads/*/reject").hasRole("ADMIN")

                // ✅ Allow Ad status update (for Payment microservice)
                .requestMatchers("/api/ads/**").permitAll()

                // ✅ Subscription plans: anyone can browse, only admins can manage
                .requestMatchers(HttpMethod.GET, "/api/subscription-plans/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/subscription-plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/subscription-plans/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/subscription-plans/**").hasRole("ADMIN")

                // ✅ Role-based restrictions
                .requestMatchers("/api/admins/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/locations/**").hasRole("ADMIN")
                .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                .requestMatchers("/api/vendors/**").hasRole("VENDOR")
                .requestMatchers(HttpMethod.PUT, "/api/users/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/users/*").hasRole("ADMIN")
                .requestMatchers("/api/users/**").hasAnyRole("ADMIN","CUSTOMER","VENDOR")

                // ✅ All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}