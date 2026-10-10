package com.mihotel.alojamiento.dto;

import jakarta.validation.constraints.NotBlank;

public record RechazoRequest(

        @NotBlank(message = "El motivo es obligatorio")
        String motivo
) {}
