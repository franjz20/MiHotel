package com.mihotel.alojamiento.dto;

import com.mihotel.alojamiento.TipoAlojamiento;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.Set;

public record AlojamientoRequest(

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotNull(message = "El tipo es obligatorio")
        TipoAlojamiento tipo,

        String descripcion,

        @NotBlank(message = "La direccion es obligatoria")
        String direccion,

        @NotBlank(message = "La ciudad es obligatoria")
        String ciudad,

        String provincia,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud,
        String telefono,

        @Email(message = "El email de contacto no tiene un formato valido")
        String emailContacto,

        Set<Long> servicioIds
) {}
