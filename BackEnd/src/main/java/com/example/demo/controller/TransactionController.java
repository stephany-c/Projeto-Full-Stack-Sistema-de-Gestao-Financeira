package com.example.demo.controller;

import com.example.demo.dto.TransactionRequestDTO;
import com.example.demo.dto.TransactionResponseDTO;
import com.example.demo.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller responsável pelas operações de Transações Financeiras.
 * Fornece endpoints para criação, leitura, atualização, exclusão e filtragem de
 * transações.
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final com.example.demo.service.ExcelExportService excelExportService;

    @GetMapping("/export/{userId}")
    public ResponseEntity<byte[]> exportTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) com.example.demo.entity.TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate)
            throws java.io.IOException {

        LocalDate finalStartDate = (startDate != null) ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate finalEndDate = (endDate != null) ? endDate : LocalDate.of(2099, 12, 31);

        List<TransactionResponseDTO> transactions = transactionService.findByUserAndPeriodList(
                userId, type, categoryId, finalStartDate, finalEndDate);

        byte[] excelContent = excelExportService.exportTransactions(transactions);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType
                .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "transacoes.xlsx");

        return new ResponseEntity<>(excelContent, headers, org.springframework.http.HttpStatus.OK);
    }

    /**
     * Recupera transações de um usuário com filtros opcionais (tipo, categoria,
     * período) e paginação.
     * 
     * @param userId     ID do usuário proprietário das transações.
     * @param type       Filtro por tipo (RECEITA/DESPESA).
     * @param categoryId Filtro por ID da categoria.
     * @param startDate  Data inicial do período.
     * @param endDate    Data final do período.
     * @param page       Número da página (0-indexed).
     * @param size       Quantidade de itens por página.
     * @return Página de transações filtradas.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<org.springframework.data.domain.Page<TransactionResponseDTO>> getTransactions(
            @PathVariable Long userId,
            @RequestParam(required = false) com.example.demo.entity.TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        LocalDate finalStartDate = (startDate != null) ? startDate : LocalDate.of(2000, 1, 1);
        LocalDate finalEndDate = (endDate != null) ? endDate : LocalDate.of(2099, 12, 31);

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        return ResponseEntity.ok(transactionService.findByUserAndPeriod(
                userId, type, categoryId, finalStartDate, finalEndDate, pageable));
    }

    /**
     * Registra uma nova transação financeira.
     * 
     * @param dto Dados da transação (valor, descrição, data, categoria, tipo).
     * @return Transação criada.
     */
    @PostMapping
    public ResponseEntity<TransactionResponseDTO> create(@RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(transactionService.create(dto));
    }

    /**
     * Remove múltiplas transações de uma vez.
     * 
     * @param ids Lista de IDs das transações a serem excluídas.
     * @return Resposta sem conteúdo (204 No Content).
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultiple(@RequestBody List<Long> ids) {
        transactionService.deleteMultiple(ids);
        return ResponseEntity.noContent().build();
    }

    /**
     * Remove uma transação permanente pelo seu ID.
     * 
     * @param id ID da transação a ser excluída.
     * @return Resposta sem conteúdo (204 No Content).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca os detalhes de uma transação específica.
     * 
     * @param id ID da transação.
     * @return Transação encontrada.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    /**
     * Atualiza os dados de uma transação existente.
     * 
     * @param id  ID da transação a ser editada.
     * @param dto Novos dados da transação.
     * @return Transação atualizada.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> update(@PathVariable Long id,
            @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(transactionService.update(id, dto));
    }
}
