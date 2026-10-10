package com.mihotel.alojamiento;

import com.mihotel.alojamiento.dto.*;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.habitacion.HabitacionService;
import com.mihotel.habitacion.dto.HabitacionRequest;
import com.mihotel.habitacion.dto.HabitacionResponse;
import com.mihotel.reserva.ReservaService;
import com.mihotel.reserva.dto.EstadisticasResponse;
import com.mihotel.reserva.dto.ReservaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/alojamientos")
public class AlojamientoController {

    private final AlojamientoService alojamientoService;
    private final HabitacionService habitacionService;
    private final ReservaService reservaService;

    public AlojamientoController(AlojamientoService alojamientoService,
                                 HabitacionService habitacionService,
                                 ReservaService reservaService) {
        this.alojamientoService = alojamientoService;
        this.habitacionService = habitacionService;
        this.reservaService = reservaService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<AlojamientoResponse> crear(
            @Valid @RequestBody AlojamientoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alojamientoService.crear(request, usuario.getId()));
    }

    @GetMapping
    public List<AlojamientoResumenResponse> listar(
            @RequestParam(required = false) String ciudad,
            @RequestParam(required = false) TipoAlojamiento tipo) {
        return alojamientoService.listarPublicos(ciudad, tipo);
    }

    @GetMapping("/mios")
    @PreAuthorize("hasRole('DUENO')")
    public List<AlojamientoResumenResponse> mios(
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return alojamientoService.listarMios(usuario.getId());
    }

    @GetMapping("/{id}")
    public AlojamientoResponse detalle(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return alojamientoService.detalle(id, usuario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DUENO')")
    public AlojamientoResponse editar(
            @PathVariable Long id,
            @Valid @RequestBody AlojamientoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return alojamientoService.editar(id, request, usuario);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('DUENO', 'ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        alojamientoService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/habitaciones")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<HabitacionResponse> crearHabitacion(
            @PathVariable Long id,
            @Valid @RequestBody HabitacionRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitacionService.crear(id, request, usuario));
    }

    @GetMapping("/{id}/habitaciones")
    public List<HabitacionResponse> listarHabitaciones(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return habitacionService.listar(id, usuario);
    }

    @GetMapping("/{id}/reservas")
    @PreAuthorize("hasRole('DUENO')")
    public List<ReservaResponse> reservas(@PathVariable Long id,
                                          @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.listarPorAlojamiento(id, usuario);
    }

    @GetMapping("/{id}/estadisticas")
    @PreAuthorize("hasRole('DUENO')")
    public EstadisticasResponse estadisticas(@PathVariable Long id,
                                             @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return reservaService.estadisticas(id, usuario);
    }

    @PostMapping("/{id}/fotos")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<FotoResponse> agregarFoto(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alojamientoService.agregarFoto(id, archivo, usuario));
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<Void> eliminarFoto(
            @PathVariable Long id,
            @PathVariable Long fotoId,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        alojamientoService.eliminarFoto(id, fotoId, usuario);
        return ResponseEntity.noContent().build();
    }
}
