package com.mihotel.alojamiento.dto;

public record FotoResponse(
        Long id,
        String url,
        boolean esPortada
) {}
