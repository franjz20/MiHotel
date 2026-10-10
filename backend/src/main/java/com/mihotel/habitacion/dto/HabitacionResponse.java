package com.mihotel.habitacion.dto;

import com.mihotel.habitacion.Habitacion;

import java.math.BigDecimal;
import java.util.List;

public record HabitacionResponse(
        Long id,
        String nombre,
        String descripcion,
        int capacidad,
        int cantidad,
        BigDecimal precioPorNoche,
        boolean activa,
        List<FotoHabitacionResponse> fotos,
        List<TemporadaResponse> temporadas,
        List<BloqueoResponse> bloqueos
) {
    public static HabitacionResponse de(Habitacion h) {
        return new HabitacionResponse(
                h.getId(), h.getNombre(), h.getDescripcion(), h.getCapacidad(),
                h.getCantidad(), h.getPrecioPorNoche(), h.isActiva(),
                h.getFotos().stream()
                        .map(f -> new FotoHabitacionResponse(f.getId(), f.getUrl()))
                        .toList(),
                h.getTemporadas().stream().map(TemporadaResponse::de).toList(),
                h.getBloqueos().stream().map(BloqueoResponse::de).toList());
    }
}
