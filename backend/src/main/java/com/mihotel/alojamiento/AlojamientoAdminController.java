package com.mihotel.alojamiento;

import com.mihotel.alojamiento.dto.AlojamientoResumenResponse;
import com.mihotel.alojamiento.dto.AlojamientoResponse;
import com.mihotel.alojamiento.dto.RechazoRequest;
import com.mihotel.common.config.UsuarioAutenticado;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/alojamientos")
public class AlojamientoAdminController {

    private final AlojamientoService alojamientoService;

    public AlojamientoAdminController(AlojamientoService alojamientoService) {
        this.alojamientoService = alojamientoService;
    }

    @GetMapping("/pendientes")
    public List<AlojamientoResumenResponse> pendientes() {
        return alojamientoService.listarPendientes();
    }

    @PatchMapping("/{id}/aprobar")
    public AlojamientoResponse aprobar(@PathVariable Long id,
                                     @AuthenticationPrincipal UsuarioAutenticado actor) {
        return alojamientoService.cambiarEstado(id, EstadoAlojamiento.APROBADO, null, actor);
    }

    @PatchMapping("/{id}/rechazar")
    public AlojamientoResponse rechazar(@PathVariable Long id,
                                        @Valid @RequestBody RechazoRequest request,
                                        @AuthenticationPrincipal UsuarioAutenticado actor) {
        return alojamientoService.cambiarEstado(id, EstadoAlojamiento.RECHAZADO, request.motivo(), actor);
    }

    @PatchMapping("/{id}/suspender")
    public AlojamientoResponse suspender(@PathVariable Long id,
                                         @Valid @RequestBody RechazoRequest request,
                                         @AuthenticationPrincipal UsuarioAutenticado actor) {
        return alojamientoService.cambiarEstado(id, EstadoAlojamiento.SUSPENDIDO, request.motivo(), actor);
    }
}
