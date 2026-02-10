package com.example.demo.repository;

import com.example.demo.entity.Transaction;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
        List<Transaction> findByUserOrderByDateDesc(User user);

        List<Transaction> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate startDate, LocalDate endDate);

        @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t WHERE t.user = :user " +
                        "AND (:type IS NULL OR t.type = :type) " +
                        "AND (:categoryId IS NULL OR t.category.id = :categoryId) " +
                        "AND (t.date BETWEEN :startDate AND :endDate) " +
                        "ORDER BY t.date DESC")
        List<Transaction> findByFilters(
                        @org.springframework.data.repository.query.Param("user") User user,
                        @org.springframework.data.repository.query.Param("type") com.example.demo.entity.TransactionType type,
                        @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
                        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
                        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate);

        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.data.jpa.repository.Query("UPDATE Transaction t SET t.category.id = :newCategoryId WHERE t.category.id = :oldCategoryId")
        void updateCategory(@org.springframework.data.repository.query.Param("oldCategoryId") Long oldCategoryId,
                        @org.springframework.data.repository.query.Param("newCategoryId") Long newCategoryId);
}
