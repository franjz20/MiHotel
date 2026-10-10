package com.mihotel.reserva.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record ReservaRequest(

        @NotNull(message = "La habitacion es obligatoria")
        Long habitacionId,

        @NotNull(message = "La fecha de check-in es obligatoria")
        LocalDate checkIn,

        @NotNull(message = "La fecha de check-out es obligatoria")
        LocalDate checkOut,

        @NotNull(message = "La cantidad de unidades es obligatoria")
        @Min(value = 1, message = "Debe reservar al menos 1 unidad")
        Integer cantidadUnidades,

        @NotBlank(message = "El nombre del huesped es obligatorio")
        String huespedNombre,

        @NotBlank(message = "El telefono del huesped es obligatorio")
        String huespedTelefono,

        @NotBlank(message = "El email del huesped es obligatorio")
        @Email(message = "El email del huesped no tiene un formato valido")
        String huespedEmail
) {}
