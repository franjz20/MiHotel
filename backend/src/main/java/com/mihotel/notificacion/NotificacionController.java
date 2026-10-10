package com.mihotel.notificacion;

import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.notificacion.dto.NotificacionResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @GetMapping
    public List<NotificacionResponse> mias(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return notificacionService.mias(usuario.getId());
    }

    @GetMapping("/no-leidas")
    public Map<String, Long> noLeidas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return Map.of("cantidad", notificacionService.noLeidas(usuario.getId()));
    }

    @PatchMapping("/{id}/leer")
    public void marcarLeida(@PathVariable Long id,
                            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacionService.marcarLeida(id, usuario.getId());
    }

    @PatchMapping("/leer-todas")
    public void marcarTodas(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        notificacionService.marcarTodasLeidas(usuario.getId());
    }
}
