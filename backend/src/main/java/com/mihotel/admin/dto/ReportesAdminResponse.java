package com.mihotel.admin.dto;

import java.math.BigDecimal;
import java.util.List;

public record ReportesAdminResponse(
        List<MesReservas> reservasPorMes,
        List<TopAlojamiento> topAlojamientos,
        double tasaCancelacion,
        double tasaRechazo
) {
    public record MesReservas(String mes, long total) {
    }

    public record TopAlojamiento(Long id, String nombre, String ciudad,
                                 long totalReservas, BigDecimal ingresos) {
    }
}
