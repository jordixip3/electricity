package com.electricidad.service;

import com.electricidad.model.Incidencia;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(30, 41, 82);
    private static final DeviceRgb ROW_ALT_COLOR = new DeviceRgb(240, 244, 255);

    // ─────────────────────────────────────────────────────────────
    // PDF EXPORT
    // ─────────────────────────────────────────────────────────────

    public byte[] exportIncidenciasToPdf(List<Incidencia> incidencias) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
        PdfFont regularFont = PdfFontFactory.createFont(com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

        // ── Title
        Paragraph title = new Paragraph("SISTEMA DE GESTIÓN ELÉCTRICA")
                .setFont(boldFont)
                .setFontSize(18)
                .setFontColor(HEADER_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        document.add(title);

        Paragraph subtitle = new Paragraph("Reporte de Incidencias — Generado: " + LocalDate.now().format(FMT))
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(subtitle);

        // ── Summary
        long totalAbiertas = incidencias.stream().filter(i -> "ABIERTA".equalsIgnoreCase(i.getEstado())).count();

        Paragraph summary = new Paragraph(
                String.format("Total incidencias: %d   |   Abiertas: %d   |   Resueltas: %d",
                        incidencias.size(), totalAbiertas, incidencias.size() - totalAbiertas))
                .setFont(regularFont)
                .setFontSize(9)
                .setFontColor(ColorConstants.DARK_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(16);
        document.add(summary);

        // ── Table
        Table table = new Table(UnitValue.createPercentArray(new float[]{1f, 2f, 2f, 2f, 4f, 1.5f}));
        table.setWidth(UnitValue.createPercentValue(100));

        String[] headers = {"ID", "Cliente", "Contador (S/N)", "Fecha", "Descripción", "Estado"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setFont(boldFont).setFontSize(9).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(HEADER_COLOR)
                    .setPadding(6)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        boolean alt = false;
        for (Incidencia i : incidencias) {
            DeviceRgb rowColor = alt ? ROW_ALT_COLOR : new DeviceRgb(255, 255, 255);
            String cliente = (i.getMedidor() != null && i.getMedidor().getCliente() != null)
                    ? i.getMedidor().getCliente().getNombre() : "—";
            String medidor = i.getMedidor() != null ? i.getMedidor().getNumeroSerie() : "—";
            String estado = i.getEstado() != null ? i.getEstado().toUpperCase() : "—";
            
            DeviceRgb estadoColor = "RESUELTA".equalsIgnoreCase(estado)
                    ? new DeviceRgb(39, 174, 96) : new DeviceRgb(192, 57, 43);

            addCell(table, String.valueOf(i.getId()), regularFont, rowColor, TextAlignment.CENTER);
            addCell(table, cliente, regularFont, rowColor, TextAlignment.LEFT);
            addCell(table, medidor, regularFont, rowColor, TextAlignment.LEFT);
            addCell(table, i.getFechaIncidencia() != null ? i.getFechaIncidencia().format(FMT) : "—", regularFont, rowColor, TextAlignment.CENTER);
            addCell(table, i.getDescripcion() != null ? i.getDescripcion() : "—", regularFont, rowColor, TextAlignment.LEFT);

            // Estado con color
            table.addCell(new Cell()
                    .add(new Paragraph(estado).setFont(boldFont).setFontSize(8).setFontColor(estadoColor))
                    .setBackgroundColor(rowColor)
                    .setPadding(5)
                    .setTextAlignment(TextAlignment.CENTER));

            alt = !alt;
        }

        document.add(table);

        // ── Footer
        Paragraph footer = new Paragraph("Sistema de Gestión Eléctrica — Documento generado automáticamente")
                .setFont(regularFont)
                .setFontSize(8)
                .setFontColor(ColorConstants.LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addCell(Table table, String text, PdfFont font, DeviceRgb bg, TextAlignment align) {
        table.addCell(new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(9))
                .setBackgroundColor(bg)
                .setPadding(5)
                .setTextAlignment(align));
    }

    // ─────────────────────────────────────────────────────────────
    // EXCEL EXPORT
    // ─────────────────────────────────────────────────────────────

    public byte[] exportIncidenciasToExcel(List<Incidencia> incidencias) throws IOException {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Incidencias");

            // ── Styles
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle altStyle = workbook.createCellStyle();
            altStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            altStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle normalStyle = workbook.createCellStyle();
            normalStyle.setFillForegroundColor(IndexedColors.WHITE.getIndex());
            normalStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle greenStyle = workbook.createCellStyle();
            greenStyle.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            greenStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle redStyle = workbook.createCellStyle();
            redStyle.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            redStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ── Title row
            Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("REPORTE DE INCIDENCIAS — SISTEMA GESTIÓN ELÉCTRICA");
            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            Row dateRow = sheet.createRow(1);
            dateRow.createCell(0).setCellValue("Generado: " + LocalDate.now().format(FMT));
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));
            sheet.createRow(2); // blank

            // ── Header row
            String[] headers = {"ID", "Cliente", "Contador (S/N)", "Fecha Incidencia", "Descripción", "Estado"};
            Row headerRow = sheet.createRow(3);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ── Data rows
            int rowNum = 4;
            for (Incidencia inc : incidencias) {
                Row row = sheet.createRow(rowNum++);
                boolean isAlt = (rowNum % 2 == 0);
                CellStyle base = isAlt ? altStyle : normalStyle;

                String cliente = (inc.getMedidor() != null && inc.getMedidor().getCliente() != null)
                        ? inc.getMedidor().getCliente().getNombre() : "—";
                String medidor = inc.getMedidor() != null ? inc.getMedidor().getNumeroSerie() : "—";
                String estado = inc.getEstado() != null ? inc.getEstado().toUpperCase() : "ABIERTA";

                setCell(row, 0, inc.getId().toString(), base);
                setCell(row, 1, cliente, base);
                setCell(row, 2, medidor, base);
                setCell(row, 3, inc.getFechaIncidencia() != null ? inc.getFechaIncidencia().format(FMT) : "—", base);
                setCell(row, 4, inc.getDescripcion() != null ? inc.getDescripcion() : "—", base);

                org.apache.poi.ss.usermodel.Cell estadoCell = row.createCell(5);
                estadoCell.setCellValue(estado);
                estadoCell.setCellStyle("RESUELTA".equalsIgnoreCase(estado) ? greenStyle : redStyle);
            }

            // ── Column widths
            sheet.setColumnWidth(0, 8 * 256);
            sheet.setColumnWidth(1, 25 * 256);
            sheet.setColumnWidth(2, 20 * 256);
            sheet.setColumnWidth(3, 18 * 256);
            sheet.setColumnWidth(4, 40 * 256);
            sheet.setColumnWidth(5, 15 * 256);

            // ── Freeze header
            sheet.createFreezePane(0, 4);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private void setCell(Row row, int col, String value, CellStyle style) {
        org.apache.poi.ss.usermodel.Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }
}
