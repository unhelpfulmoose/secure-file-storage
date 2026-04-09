package com.eva.securefiles.config;

import com.eva.securefiles.service.UserService;
import com.eva.securefiles.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

// Creates the default admin user on first startup if no users exist in the database.
@Component
public class AdminSeeder implements ApplicationRunner {

    @Value("${app.admin.password}")
    private String adminPassword;

    private final UserService userService;
    private final UserRepository userRepository;

    public AdminSeeder(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByUsername("admin")) {
            userService.createUser("admin", adminPassword, "ADMIN");
        }
    }
}
