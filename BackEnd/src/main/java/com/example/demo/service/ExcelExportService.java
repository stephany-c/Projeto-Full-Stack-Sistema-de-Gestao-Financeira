package com.example.demo.service;

import com.example.demo.dto.TransactionResponseDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    public byte[] exportTransactions(List<TransactionResponseDTO> transactions) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transações");

            // Estilo de cabeçalho
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

           
            // Criar linha de cabeçalho
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Data", "Descrição", "Categoria", "Tipo", "Valor" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            
// Criar linhas de dados
            int rowIdx = 1;
            CreationHelper createHelper = workbook.getCreationHelper();
            CellStyle dateStyle = workbook.createCellStyle();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/mm/yyyy"));

            for (TransactionResponseDTO t : transactions) {
                Row row = sheet.createRow(rowIdx++);

                // Date
                Cell dateCell = row.createCell(0);
                dateCell.setCellValue(java.sql.Date.valueOf(t.getDate()));
                dateCell.setCellStyle(dateStyle);

                row.createCell(1).setCellValue(t.getDescription());
                row.createCell(2).setCellValue(t.getCategoryName());

                // Type translation
                String typeLabel = "INCOME".equals(t.getType().toString()) ? "RECEITA" : "DESPESA";
                row.createCell(3).setCellValue(typeLabel);

                row.createCell(4).setCellValue(t.getAmount().doubleValue());
            }

            
// Colunas com dimensionamento automático
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
