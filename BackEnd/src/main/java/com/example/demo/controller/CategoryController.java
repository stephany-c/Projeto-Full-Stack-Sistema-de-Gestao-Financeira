package com.example.demo.controller;

import com.example.demo.dto.CategoryRequestDTO;
import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/user/{userId}")
    public List<CategoryResponseDTO> getByUser(@PathVariable Long userId) {
        return categoryService.findAllByUser(userId);
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<?> create(@RequestBody CategoryRequestDTO dto, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(categoryService.create(dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/user/{userId}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CategoryRequestDTO dto,
            @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(categoryService.update(id, dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long userId,
            @RequestParam(required = false) Long transferTo) {
        categoryService.delete(id, transferTo, userId);
        return ResponseEntity.noContent().build();
    }
}
