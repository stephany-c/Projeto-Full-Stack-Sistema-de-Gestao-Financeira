package com.example.demo.controller;

import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/user/{userId}")
    public List<CategoryResponseDTO> getByUser(@PathVariable Long userId) {
        return categoryService.findAllByUser(userId);
    }

    @PostMapping
    public CategoryResponseDTO create(@RequestParam String name, @RequestParam String icon, @RequestParam Long userId) {
        return categoryService.create(name, icon, userId);
    }
}
