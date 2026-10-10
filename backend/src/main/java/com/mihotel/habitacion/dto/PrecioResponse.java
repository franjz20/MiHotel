package com.mihotel.habitacion.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record PrecioResponse(
        BigDecimal total,
        List<NochePrecio> noches
) {
    public record NochePrecio(
            LocalDate fecha,
            BigDecimal precio,
            String temporada
    ) {}
}
