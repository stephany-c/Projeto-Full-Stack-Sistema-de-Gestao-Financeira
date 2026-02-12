package com.example.demo.dto;

import com.example.demo.entity.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransactionRequestDTO {
    @jakarta.validation.constraints.NotBlank(message = "A descrição é obrigatória")
    @jakarta.validation.constraints.Size(min = 3, message = "A descrição deve ter no mínimo 3 caracteres")
    private String description;

    @jakarta.validation.constraints.NotNull(message = "O valor é obrigatório")
    @jakarta.validation.constraints.Min(value = 0, message = "O valor deve ser positivo")
    private BigDecimal amount;

    @jakarta.validation.constraints.NotNull(message = "A data é obrigatória")
    private LocalDate date;

    @jakarta.validation.constraints.NotNull(message = "O tipo é obrigatório")
    private TransactionType type;
    private Long categoryId;
    private Long userId;
}
