package com.example.demo.controller;

import com.example.demo.dto.CategoryRequestDTO;
import com.example.demo.dto.CategoryResponseDTO;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Controller responsável pelo gerenciamento de Categorias de transações.
 * Permite criar, listar, atualizar e excluir categorias vinculadas a um
 * usuário.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * Lista todas as categorias cadastradas para um usuário específico.
     * 
     * @param userId ID do usuário logado.
     * @return Lista de DTOs representativos das categorias.
     */
    @GetMapping("/user/{userId}")
    public List<CategoryResponseDTO> getByUser(@PathVariable Long userId) {
        return categoryService.findAllByUser(userId);
    }

    /**
     * Cria uma nova categoria para o usuário.
     * 
     * @param dto    Dados da nova categoria (nome).
     * @param userId ID do usuário proprietário.
     * @return Categoria criada ou erro de validação.
     */
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> create(@RequestBody CategoryRequestDTO dto, @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(categoryService.create(dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Atualiza o nome de uma categoria existente.
     * 
     * @param id     ID da categoria a ser editada.
     * @param dto    Novos dados para a categoria.
     * @param userId ID do usuário proprietário (para verificação de segurança).
     * @return Categoria atualizada ou erro se o nome for duplicado.
     */
    @PutMapping("/{id}/user/{userId}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CategoryRequestDTO dto,
            @PathVariable Long userId) {
        try {
            return ResponseEntity.ok(categoryService.update(id, dto, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Exclui uma categoria do sistema.
     * Caso existam transações vinculadas, elas podem ser movidas para outra
     * categoria
     * ou excluídas permanentemente se o parâmetro transferTo não for informado.
     * 
     * @param id         ID da categoria a ser excluída.
     * @param userId     ID do usuário (validação).
     * @param transferTo (Opcional) ID da nova categoria que receberá as transações.
     * @return 204 No Content após sucesso.
     */
    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @PathVariable Long userId,
            @RequestParam(required = false) Long transferTo) {
        categoryService.delete(id, transferTo, userId);
        return ResponseEntity.noContent().build();
    }
}
