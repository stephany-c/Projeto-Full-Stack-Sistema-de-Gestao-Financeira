package com.example.demo.config;

import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import com.example.demo.service.CategoryService;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println(">>> Verificando dados iniciais...");

        User admin = userRepository.findByEmail("admin@admin.com").orElseGet(() -> {
            User defaultUser = User.builder()
                    .name("Usuário Padrão")
                    .email("admin@admin.com")
                    .password(passwordEncoder.encode("123456"))
                    .build();
            User saved = userRepository.save(defaultUser);
            System.out.println("✅ Usuário padrão criado.");
            return saved;
        });

        if (categoryRepository.findByUser(admin).isEmpty()) {
            categoryService.initializeDefaultCategories(admin);
            System.out.println("✅ Categorias iniciais criadas para o admin.");
        }

    }
}
