package com.mihotel.habitacion.dto;

import com.mihotel.habitacion.Temporada;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TemporadaResponse(
        Long id,
        String nombre,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        BigDecimal precioPorNoche
) {
    public static TemporadaResponse de(Temporada t) {
        return new TemporadaResponse(t.getId(), t.getNombre(),
                t.getFechaInicio(), t.getFechaFin(), t.getPrecioPorNoche());
    }
}
