package com.mihotel.admin;

import com.mihotel.admin.dto.CambiarRolRequest;
import com.mihotel.admin.dto.EstadisticasAdminResponse;
import com.mihotel.admin.dto.ReportesAdminResponse;
import com.mihotel.admin.dto.UsuarioAdminResponse;
import com.mihotel.alojamiento.dto.AlojamientoResumenResponse;
import com.mihotel.auditoria.AuditoriaService;
import com.mihotel.auditoria.dto.AuditoriaResponse;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.reserva.EstadoReserva;
import com.mihotel.reserva.dto.ReservaResponse;
import com.mihotel.usuario.Rol;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final AuditoriaService auditoriaService;

    public AdminController(AdminService adminService, AuditoriaService auditoriaService) {
        this.adminService = adminService;
        this.auditoriaService = auditoriaService;
    }

    // ---- Usuarios ----

    @GetMapping("/usuarios")
    public List<UsuarioAdminResponse> usuarios(@RequestParam(required = false) Rol rol,
                                               @RequestParam(required = false) String q) {
        return adminService.listarUsuarios(rol, q);
    }

    @PatchMapping("/usuarios/{id}/activo")
    public UsuarioAdminResponse cambiarActivo(@PathVariable Long id,
                                              @RequestBody Map<String, Boolean> body,
                                              @AuthenticationPrincipal UsuarioAutenticado actor) {
        return adminService.cambiarActivo(id, Boolean.TRUE.equals(body.get("activo")), actor);
    }

    @PatchMapping("/usuarios/{id}/rol")
    public UsuarioAdminResponse cambiarRol(@PathVariable Long id,
                                           @Valid @RequestBody CambiarRolRequest request,
                                           @AuthenticationPrincipal UsuarioAutenticado actor) {
        return adminService.cambiarRol(id, request.rol(), actor);
    }

    // ---- Reservas ----

    @GetMapping("/reservas")
    public List<ReservaResponse> reservas(@RequestParam(required = false) EstadoReserva estado) {
        return adminService.listarReservas(estado);
    }

    @PatchMapping("/reservas/{id}/cancelar")
    public ReservaResponse cancelarReserva(@PathVariable Long id,
                                           @RequestBody(required = false) Map<String, String> body,
                                           @AuthenticationPrincipal UsuarioAutenticado actor) {
        return adminService.cancelarReserva(id, body != null ? body.get("motivo") : null, actor);
    }

    // ---- Alojamientos ----

    @GetMapping("/alojamientos")
    public List<AlojamientoResumenResponse> todosLosAlojamientos() {
        return adminService.todosLosAlojamientos();
    }

    // ---- Estadisticas, reportes y auditoria ----

    @GetMapping("/estadisticas")
    public EstadisticasAdminResponse estadisticas() {
        return adminService.estadisticas();
    }

    @GetMapping("/reportes")
    public ReportesAdminResponse reportes() {
        return adminService.reportes();
    }

    @GetMapping("/auditoria")
    public List<AuditoriaResponse> auditoria() {
        return auditoriaService.ultimas();
    }
}
