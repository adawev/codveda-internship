package com.codveda.backend.config;

import com.codveda.backend.model.User;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev")
public class AdminSeederConfig {
    private static final Logger log = LoggerFactory.getLogger(AdminSeederConfig.class);

    @Bean
    CommandLineRunner seedDefaultAdmin(
            UserService userService,
            @Value("${app.admin.name:Default Admin}") String adminName,
            @Value("${app.admin.email:admin@codveda.com}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword
    ) {
        return args -> {
            userService.findByEmail(adminEmail).ifPresentOrElse(existing -> {
                if (existing.getRole() != Role.ADMIN) {
                    existing.setRole(Role.ADMIN);
                    userService.save(existing);
                    log.info("Promoted existing user to ADMIN: {}", adminEmail);
                }
            }, () -> {
                User admin = new User();
                admin.setName(adminName);
                admin.setEmail(adminEmail);
                admin.setPassword(adminPassword);
                admin.setRole(Role.ADMIN);
                userService.save(admin);
                log.info("Created default ADMIN user: {}", adminEmail);
            });
        };
    }
}
