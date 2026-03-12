package com.example.demo.repository;

import com.example.demo.entity.Transaction;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repositório para operações de banco de dados na entidade Transaction.
 * Contém consultas customizadas para filtragem avançada e atualizações em lote.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
        List<Transaction> findByUserOrderByDateDesc(User user);

        List<Transaction> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate startDate, LocalDate endDate);

        /**
         * Executa uma busca filtrada e paginada de transações.
         * Suporta filtros nulos, permitindo consultas flexíveis.
         */
        @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.user = :user " +
                        "AND (:type IS NULL OR t.type = :type) " +
                        "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
                        "AND (t.date BETWEEN :startDate AND :endDate) " +
                        "ORDER BY t.date DESC")
        org.springframework.data.domain.Page<Transaction> findByFilters(
                        @org.springframework.data.repository.query.Param("user") User user,
                        @org.springframework.data.repository.query.Param("type") com.example.demo.entity.TransactionType type,
                        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
                        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
                        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate,
                        org.springframework.data.domain.Pageable pageable);

        @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.user = :user " +
                        "AND (:type IS NULL OR t.type = :type) " +
                        "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
                        "AND (t.date BETWEEN :startDate AND :endDate) " +
                        "ORDER BY t.date DESC")
        List<Transaction> findByFiltersList(
                        @org.springframework.data.repository.query.Param("user") User user,
                        @org.springframework.data.repository.query.Param("type") com.example.demo.entity.TransactionType type,
                        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
                        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
                        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate);

        /**
         * Atualiza em lote a categoria de todas as transações de uma categoria antiga
         * para uma nova.
         */
        @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
        @org.springframework.data.jpa.repository.Query("UPDATE Transaction t SET t.category.id = :newCategoryId WHERE t.category.id = :oldCategoryId")
        void updateCategory(@org.springframework.data.repository.query.Param("oldCategoryId") Long oldCategoryId,
                        @org.springframework.data.repository.query.Param("newCategoryId") Long newCategoryId);

        /**
         * Remove todas as transações associadas a uma categoria específica.
         */
        @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
        @org.springframework.data.jpa.repository.Query("DELETE FROM Transaction t WHERE t.category.id = :categoryId")
        void deleteByCategoryId(@org.springframework.data.repository.query.Param("categoryId") Long categoryId);
}
