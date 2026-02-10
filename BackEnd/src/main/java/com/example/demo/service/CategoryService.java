package com.example.demo.service;

import com.example.demo.dto.CategoryRequestDTO;
import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAllByUser(Long userId) {
        return categoryRepository.findByUser_Id(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponseDTO create(CategoryRequestDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = Category.builder()
                .name(dto.getName())
                .user(user)
                .build();

        Category saved = categoryRepository.save(category);
        return toDTO(saved);
    }

    @Transactional
    public CategoryResponseDTO update(Long categoryId, CategoryRequestDTO dto, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        category.setName(dto.getName());

        Category updated = categoryRepository.save(category);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long categoryId, Long transferToCategoryId, Long userId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (transferToCategoryId != null) {
            transactionRepository.updateCategory(categoryId, transferToCategoryId);
        }

        categoryRepository.delete(category);
    }

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
