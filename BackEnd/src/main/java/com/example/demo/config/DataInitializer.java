package com.example.demo.config;

import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        System.out.println(">>> Verificando dados iniciais...");

        if (userRepository.count() == 0) {
            User defaultUser = User.builder()
                    .name("Usuário Padrão")
                    .email("admin@admin.com")
                    .password("123456")
                    .build();
            userRepository.save(defaultUser);
            System.out.println("✅ Usuário padrão criado.");
        }

        User user = userRepository.findByEmail("admin@admin.com")
                .orElseThrow(() -> new RuntimeException("Default user not found"));

        if (categoryRepository.count() == 0) {
            createDefaultCategories(user);
            System.out.println("✅ Categorias padrões criadas.");
        }
    }

    private void createDefaultCategories(User user) {
        String[] names = { "Alimentação", "Transporte", "Lazer", "Moradia", "Saúde", "Outros" };
        String[] icons = { "🍔", "🚗", "🏖️", "🏠", "🏥", "📦" };

        for (int i = 0; i < names.length; i++) {
            Category category = Category.builder()
                    .name(names[i])
                    .icon(icons[i])
                    .user(user)
                    .build();
            categoryRepository.save(category);
        }
    }
}
