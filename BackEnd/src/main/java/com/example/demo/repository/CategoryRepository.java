package com.example.demo.repository;

import com.example.demo.entity.Category;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUser(User user);

    List<Category> findByUser_Id(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE c.user.id = :userId OR c.user IS NULL")
    List<Category> findAllByUserIdOrGlobal(Long userId);

    long countByUserIsNull();
}
