package com.mihotel.auditoria.dto;

import com.mihotel.auditoria.Auditoria;

import java.time.LocalDateTime;

public record AuditoriaResponse(
        Long id,
        String actorEmail,
        String accion,
        String entidad,
        Long entidadId,
        String detalle,
        LocalDateTime createdAt
) {
    public static AuditoriaResponse de(Auditoria a) {
        return new AuditoriaResponse(a.getId(), a.getActorEmail(), a.getAccion(),
                a.getEntidad(), a.getEntidadId(), a.getDetalle(), a.getCreatedAt());
    }
}
