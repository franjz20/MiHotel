package com.mihotel.habitacion.dto;

public record DisponibilidadResponse(
        boolean disponible,
        int unidadesLibres,
        int cantidadTotal,
        boolean bloqueada
) {}
