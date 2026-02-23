package com.example.demo.service;

import com.example.demo.dto.CategoryRequestDTO;
import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User user;
    private Category category;
    private CategoryRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@test.com").build();
        category = Category.builder().id(1L).name("Food").user(user).build();

        requestDTO = new CategoryRequestDTO();
        requestDTO.setName("New Category");
    }

    @Test
    void findAllByUser_ShouldReturnDTOList() {
        when(categoryRepository.findByUser_Id(1L)).thenReturn(Arrays.asList(category));

        List<CategoryResponseDTO> result = categoryService.findAllByUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Food", result.get(0).getName());
    }

    @Test
    void create_ShouldReturnDTO_WhenValid() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(categoryRepository.existsByNameIgnoreCaseAndUser_Id(anyString(), anyLong())).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryResponseDTO result = categoryService.create(requestDTO, 1L);

        assertNotNull(result);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void create_ShouldThrowException_WhenCategoryExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(categoryRepository.existsByNameIgnoreCaseAndUser_Id(anyString(), anyLong())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.create(requestDTO, 1L));
    }

    @Test
    void delete_ShouldCallRepository_WhenAuthorized() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));

        categoryService.delete(1L, null, 1L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void initializeDefaultCategories_ShouldSaveAll() {
        categoryService.initializeDefaultCategories(user);
        verify(categoryRepository).saveAll(anyList());
    }
}
