package com.mihotel.habitacion.dto;

import com.mihotel.habitacion.HabitacionBloqueo;

import java.time.LocalDate;

public record BloqueoResponse(
        Long id,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String motivo
) {
    public static BloqueoResponse de(HabitacionBloqueo b) {
        return new BloqueoResponse(b.getId(), b.getFechaInicio(), b.getFechaFin(), b.getMotivo());
    }
}
