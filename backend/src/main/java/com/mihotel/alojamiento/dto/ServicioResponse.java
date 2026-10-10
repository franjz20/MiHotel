package com.mihotel.alojamiento.dto;

import com.mihotel.alojamiento.Servicio;

public record ServicioResponse(
        Long id,
        String nombre
) {
    public static ServicioResponse de(Servicio s) {
        return new ServicioResponse(s.getId(), s.getNombre());
    }
}
