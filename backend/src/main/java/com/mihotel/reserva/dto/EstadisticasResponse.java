package com.mihotel.reserva.dto;

import java.math.BigDecimal;
import java.util.Map;

public record EstadisticasResponse(
        long totalReservas,
        long reservasProximas,
        long reservasPendientes,
        long reservasConfirmadas,
        long habitacionesActivas,
        BigDecimal ingresosConfirmados,
        Map<String, Long> reservasPorEstado
) {}
