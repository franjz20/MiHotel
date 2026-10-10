package com.mihotel.notificacion.dto;

import com.mihotel.notificacion.Notificacion;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        String tipo,
        String titulo,
        String mensaje,
        boolean leida,
        LocalDateTime createdAt
) {
    public static NotificacionResponse de(Notificacion n) {
        return new NotificacionResponse(n.getId(), n.getTipo(), n.getTitulo(),
                n.getMensaje(), n.isLeida(), n.getCreatedAt());
    }
}
