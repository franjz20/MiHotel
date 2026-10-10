package com.mihotel.reserva;

import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.reserva.dto.ReservaRequest;
import com.mihotel.reserva.dto.ReservaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENTE')")
    public ResponseEntity<ReservaResponse> crear(
            @Valid @RequestBody ReservaRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservaService.crear(request, usuario.getId()));
    }

    @GetMapping("/mias")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<ReservaResponse> mias(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.mias(usuario.getId());
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public ReservaResponse cancelar(@PathVariable Long id,
                                    @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.cancelar(id, usuario.getId());
    }

    @PatchMapping("/{id}/confirmar")
    @PreAuthorize("hasRole('DUENO')")
    public ReservaResponse confirmar(@PathVariable Long id,
                                     @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.confirmar(id, usuario);
    }

    @PatchMapping("/{id}/rechazar")
    @PreAuthorize("hasRole('DUENO')")
    public ReservaResponse rechazar(@PathVariable Long id,
                                    @RequestBody(required = false) Map<String, String> body,
                                    @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.rechazar(id, body != null ? body.get("motivo") : null, usuario);
    }

    @PatchMapping("/{id}/completar")
    @PreAuthorize("hasRole('DUENO')")
    public ReservaResponse completar(@PathVariable Long id,
                                     @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.completar(id, usuario);
    }
}
