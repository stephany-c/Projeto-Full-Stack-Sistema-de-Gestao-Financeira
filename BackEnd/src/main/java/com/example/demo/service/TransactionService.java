package com.example.demo.service;

import com.example.demo.dto.TransactionMapper;
import com.example.demo.dto.TransactionRequestDTO;
import com.example.demo.dto.TransactionResponseDTO;
import com.example.demo.entity.Category;
import com.example.demo.entity.Transaction;
import com.example.demo.entity.User;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.TransactionRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

        private final TransactionRepository transactionRepository;
        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        private final TransactionMapper transactionMapper;

        @Transactional(readOnly = true)
        public List<TransactionResponseDTO> findAllByUser(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));
                return transactionRepository.findByUserOrderByDateDesc(user)
                                .stream()
                                .map(transactionMapper::toResponseDTO)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public org.springframework.data.domain.Page<TransactionResponseDTO> findByUserAndPeriod(
                        Long userId,
                        com.example.demo.entity.TransactionType type,
                        Long categoryId,
                        LocalDate startDate,
                        LocalDate endDate,
                        org.springframework.data.domain.Pageable pageable) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                return transactionRepository.findByFilters(user, type, categoryId, startDate, endDate, pageable)
                                .map(transactionMapper::toResponseDTO);
        }

        @Transactional
        public TransactionResponseDTO create(TransactionRequestDTO dto) {
                User user = userRepository.findById(dto.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                Category category = categoryRepository.findById(dto.getCategoryId())
                                .orElseThrow(() -> new RuntimeException("Category not found"));

                Transaction transaction = transactionMapper.toEntity(dto, user, category);
                Transaction saved = transactionRepository.save(transaction);
                return transactionMapper.toResponseDTO(saved);
        }

        @Transactional(readOnly = true)
        public TransactionResponseDTO findById(Long id) {
                Transaction transaction = transactionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Transaction not found"));
                return transactionMapper.toResponseDTO(transaction);
        }

        @Transactional
        public TransactionResponseDTO update(Long id, TransactionRequestDTO dto) {
                Transaction transaction = transactionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Transaction not found"));

                Category category = categoryRepository.findById(dto.getCategoryId())
                                .orElseThrow(() -> new RuntimeException("Category not found"));

                transaction.setDescription(dto.getDescription());
                transaction.setAmount(dto.getAmount());
                transaction.setDate(dto.getDate());
                transaction.setType(dto.getType());
                transaction.setCategory(category);

                Transaction updated = transactionRepository.save(transaction);
                return transactionMapper.toResponseDTO(updated);
        }

        @Transactional
        public void delete(Long id) {
                if (!transactionRepository.existsById(id)) {
                        throw new RuntimeException("Transaction not found");
                }
                transactionRepository.deleteById(id);
        }
}
