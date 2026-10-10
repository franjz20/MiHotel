package com.mihotel.reserva.dto;

import com.mihotel.reserva.EstadoReserva;
import com.mihotel.reserva.Reserva;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ReservaResponse(
        Long id,
        Long habitacionId,
        String habitacionNombre,
        Long alojamientoId,
        String alojamientoNombre,
        String alojamientoCiudad,
        String clienteEmail,
        LocalDate checkIn,
        LocalDate checkOut,
        int cantidadUnidades,
        String huespedNombre,
        String huespedTelefono,
        String huespedEmail,
        BigDecimal precioTotal,
        EstadoReserva estado,
        String motivoRechazo,
        LocalDateTime createdAt
) {
    public static ReservaResponse de(Reserva r) {
        return new ReservaResponse(
                r.getId(),
                r.getHabitacion().getId(),
                r.getHabitacion().getNombre(),
                r.getHabitacion().getAlojamiento().getId(),
                r.getHabitacion().getAlojamiento().getNombre(),
                r.getHabitacion().getAlojamiento().getCiudad(),
                r.getCliente().getEmail(),
                r.getCheckIn(),
                r.getCheckOut(),
                r.getCantidadUnidades(),
                r.getHuespedNombre(),
                r.getHuespedTelefono(),
                r.getHuespedEmail(),
                r.getPrecioTotal(),
                r.getEstado(),
                r.getMotivoRechazo(),
                r.getCreatedAt());
    }
}
