package com.mihotel.habitacion.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record HabitacionRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        String descripcion,

        @NotNull(message = "La capacidad es obligatoria")
        @Min(value = 1, message = "La capacidad debe ser al menos 1 persona")
        Integer capacidad,

        @NotNull(message = "La cantidad de unidades es obligatoria")
        @Min(value = 1, message = "Debe haber al menos 1 unidad")
        Integer cantidad,

        @NotNull(message = "El precio por noche es obligatorio")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
        BigDecimal precioPorNoche
) {}
