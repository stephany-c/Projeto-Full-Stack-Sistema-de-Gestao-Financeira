package com.example.demo.service;

import com.example.demo.dto.CategoryRequestDTO;
import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import lombok.extern.slf4j.Slf4j;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável pela lógica de negócio das Categorias.
 * Trata validações de nomes duplicados, inicialização de categorias padrão para
 * novos usuários
 * e a lógica de transferência de transações durante a exclusão.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Retorna todas as categorias de um usuário.
     */
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAllByUser(Long userId) {
        return categoryRepository.findByUser_Id(userId)
                .stream()
                .map(category -> this.toDTO(category))
                .collect(Collectors.toList());
    }

    /**
     * Cria uma nova categoria após validar se o nome já não existe para o usuário
     * informado.
     */
    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        log.info("Checking if category exists: {} for user: {}", dto.getName(), userId);
        if (categoryRepository.existsByNameIgnoreCaseAndUser_Id(dto.getName(), userId)) {
            log.warn("Category already exists: {} for user: {}", dto.getName(), userId);
            throw new IllegalArgumentException("Você já possui uma categoria com este nome.");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return toDTO(saved);
    }

    /**
     * Atualiza o nome de uma categoria, garantindo que o novo nome não cause
     * duplicidade.
     */
    @Transactional
    public CategoryResponseDTO update(Long categoryId, CategoryRequestDTO dto, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (!category.getName().equalsIgnoreCase(dto.getName()) &&
                categoryRepository.existsByNameIgnoreCaseAndUser_Id(dto.getName(), userId)) {
            throw new IllegalArgumentException("Você já possui uma categoria com este nome.");
        }

        category.setName(dto.getName());

        Category updated = categoryRepository.save(category);
        return toDTO(updated);
    }

    /**
     * Exclui uma categoria. Se transferToCategoryId for fornecido, move as
     * transações existentes;
     * caso contrário, exclui as transações vinculadas.
     */
    @Transactional
    public void delete(Long categoryId, Long transferToCategoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (transferToCategoryId != null) {
            transactionRepository.updateCategory(categoryId, transferToCategoryId);
        } else {
            transactionRepository.deleteByCategoryId(categoryId);
        }

        categoryRepository.delete(category);
    }

    /**
     * Cria o conjunto inicial de categorias para um usuário recém-cadastrado.
     */
    @Transactional
    public void initializeDefaultCategories(User user) {
        List<Category> defaultCategories = List.of(
                Category.builder().name("Alimentação").user(user).build(),
                Category.builder().name("Transporte").user(user).build(),
                Category.builder().name("Lazer").user(user).build(),
                Category.builder().name("Saúde").user(user).build(),
                Category.builder().name("Educação").user(user).build(),
                Category.builder().name("Moradia").user(user).build(),
                Category.builder().name("Outros").user(user).build());
        categoryRepository.saveAll(defaultCategories);
    }

    private CategoryResponseDTO toDTO(Category category) {
        CategoryResponseDTO dto = new CategoryResponseDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        return dto;
    }
}
