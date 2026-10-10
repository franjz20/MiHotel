package com.mihotel.alojamiento.dto;

import com.mihotel.alojamiento.Alojamiento;
import com.mihotel.alojamiento.EstadoAlojamiento;
import com.mihotel.alojamiento.TipoAlojamiento;

public record AlojamientoResumenResponse(
        Long id,
        String nombre,
        TipoAlojamiento tipo,
        String ciudad,
        String provincia,
        EstadoAlojamiento estado,
        String fotoPortada
) {
    public static AlojamientoResumenResponse de(Alojamiento a) {
        String portada = a.getFotos().stream()
                .filter(f -> f.isEsPortada())
                .map(f -> f.getUrl())
                .findFirst()
                .orElse(a.getFotos().isEmpty() ? null : a.getFotos().getFirst().getUrl());
        return new AlojamientoResumenResponse(
                a.getId(), a.getNombre(), a.getTipo(),
                a.getCiudad(), a.getProvincia(), a.getEstado(), portada);
    }
}
