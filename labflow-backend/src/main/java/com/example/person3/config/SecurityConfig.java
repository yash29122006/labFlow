package com.example.person3.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.person3.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                ))
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers(
                                "/api/auth/register/student",
                                "/api/auth/login"
                        ).permitAll()

                        // Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // All Admin endpoints
                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        // Subjects
                        .requestMatchers(HttpMethod.POST, "/api/subjects")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/subjects/*")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/subjects/*")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/subjects")
                        .hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/subjects/my")
                        .hasAnyRole("STUDENT", "FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/subjects/*")
                        .hasAnyRole("STUDENT", "FACULTY", "ADMIN")

                        // Assignments
                        .requestMatchers(HttpMethod.POST, "/api/assignments")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.PUT, "/api/assignments/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.DELETE, "/api/assignments/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.POST, "/api/assignments/*/open")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.POST, "/api/assignments/*/close")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/assignments")
                        .hasAnyRole("STUDENT", "FACULTY", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/assignments/subject/*")
                        .hasAnyRole("STUDENT", "FACULTY", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/assignments/*")
                        .hasAnyRole("STUDENT", "FACULTY", "ADMIN")

                        // Evaluation APIs
                        .requestMatchers(HttpMethod.POST, "/api/evaluations")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/evaluations/submission/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/evaluations/assignment/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.PATCH, "/api/evaluations/*/publish")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/evaluations/my")
                        .hasRole("STUDENT")

                        // Quiz APIs
                        .requestMatchers(HttpMethod.POST, "/api/quizzes")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.PUT, "/api/quizzes/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.DELETE, "/api/quizzes/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/quizzes/assignment/*")
                        .hasAnyRole("STUDENT", "FACULTY")
                        .requestMatchers(HttpMethod.POST, "/api/quizzes/assignment/*/submit")
                        .hasRole("STUDENT")

                        // Submission APIs
                        .requestMatchers(HttpMethod.POST, "/api/submissions")
                        .hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/submissions/my")
                        .hasRole("STUDENT")
                        .requestMatchers(HttpMethod.GET, "/api/submissions/assignment/*")
                        .hasRole("FACULTY")
                        .requestMatchers(HttpMethod.GET, "/api/submissions/*")
                        .hasAnyRole("STUDENT", "FACULTY")

                        // Faculty students roster
                        .requestMatchers(HttpMethod.GET, "/api/faculty/students")
                        .hasRole("FACULTY")

                        // Dashboard summary
                        .requestMatchers(HttpMethod.GET, "/api/dashboard/summary")
                        .authenticated()

                        // Code execution requires authentication
                        .requestMatchers(HttpMethod.POST, "/api/code/execute")
                        .authenticated()

                        // Everything else requires JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:4200",
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
