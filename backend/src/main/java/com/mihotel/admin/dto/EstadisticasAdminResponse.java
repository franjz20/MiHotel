package com.mihotel.admin.dto;

import java.math.BigDecimal;
import java.util.Map;

public record EstadisticasAdminResponse(
        long totalUsuarios,
        long usuariosActivos,
        Map<String, Long> usuariosPorRol,
        long totalAlojamientos,
        Map<String, Long> alojamientosPorEstado,
        long totalReservas,
        Map<String, Long> reservasPorEstado,
        long reservasUltimos30Dias,
        BigDecimal ingresosConfirmados
) {
}
