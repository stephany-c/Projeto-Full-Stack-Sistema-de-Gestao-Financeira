package com.example.demo.service;

import com.example.demo.dto.TransactionMapper;
import com.example.demo.dto.TransactionRequestDTO;
import com.example.demo.dto.TransactionResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Transaction;
import com.example.demo.entity.TransactionType;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TransactionMapper transactionMapper;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Category category;
    private Transaction transaction;
    private TransactionRequestDTO requestDTO;
    private TransactionResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("test@test.com").build();
        category = Category.builder().id(1L).name("Food").build();

        transaction = Transaction.builder()
                .id(1L)
                .description("Coffee")
                .amount(new BigDecimal("5.00"))
                .date(LocalDate.now())
                .type(TransactionType.EXPENSE)
                .user(user)
                .category(category)
                .build();

        requestDTO = new TransactionRequestDTO();
        requestDTO.setUserId(1L);
        requestDTO.setDescription("Coffee");
        requestDTO.setAmount(new BigDecimal("5.00"));
        requestDTO.setDate(LocalDate.now());
        requestDTO.setType(TransactionType.EXPENSE);
        requestDTO.setCategoryId(1L);

        responseDTO = new TransactionResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setDescription("Coffee");
        responseDTO.setAmount(new BigDecimal("5.00"));
        responseDTO.setDate(LocalDate.now());
        responseDTO.setType(TransactionType.EXPENSE);
    }

    @Test
    void create_ShouldReturnResponseDTO_WhenRequestIsValid() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(transactionMapper.toEntity(any(), any(), any())).thenReturn(transaction);
        when(transactionRepository.save(any())).thenReturn(transaction);
        when(transactionMapper.toResponseDTO(any())).thenReturn(responseDTO);

        TransactionResponseDTO result = transactionService.create(requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO.getId(), result.getId());
        verify(transactionRepository).save(any());
    }

    @Test
    void findById_ShouldReturnResponseDTO_WhenIdExists() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.of(transaction));
        when(transactionMapper.toResponseDTO(transaction)).thenReturn(responseDTO);

        TransactionResponseDTO result = transactionService.findById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void findById_ShouldThrowException_WhenIdDoesNotExist() {
        when(transactionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> transactionService.findById(1L));
    }

    @Test
    void delete_ShouldCallRepository_WhenIdExists() {
        when(transactionRepository.existsById(1L)).thenReturn(true);

        transactionService.delete(1L);

        verify(transactionRepository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowException_WhenIdDoesNotExist() {
        when(transactionRepository.existsById(1L)).thenReturn(false);

        assertThrows(RuntimeException.class, () -> transactionService.delete(1L));
    }
}
