package com.mihotel.habitacion;

import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.habitacion.dto.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/habitaciones")
public class HabitacionController {

    private final HabitacionService habitacionService;

    public HabitacionController(HabitacionService habitacionService) {
        this.habitacionService = habitacionService;
    }

    @GetMapping("/{id}")
    public HabitacionResponse detalle(@PathVariable Long id,
                                      @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return habitacionService.detalle(id, usuario);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DUENO')")
    public HabitacionResponse editar(@PathVariable Long id,
                                     @Valid @RequestBody HabitacionRequest request,
                                     @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return habitacionService.editar(id, request, usuario);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                         @AuthenticationPrincipal UsuarioAutenticado usuario) {
        habitacionService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/fotos")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<FotoHabitacionResponse> agregarFoto(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitacionService.agregarFoto(id, archivo, usuario));
    }

    @DeleteMapping("/{id}/fotos/{fotoId}")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<Void> eliminarFoto(@PathVariable Long id,
                                             @PathVariable Long fotoId,
                                             @AuthenticationPrincipal UsuarioAutenticado usuario) {
        habitacionService.eliminarFoto(id, fotoId, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/temporadas")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<TemporadaResponse> crearTemporada(
            @PathVariable Long id,
            @Valid @RequestBody TemporadaRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitacionService.crearTemporada(id, request, usuario));
    }

    @DeleteMapping("/{id}/temporadas/{temporadaId}")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<Void> eliminarTemporada(@PathVariable Long id,
                                                  @PathVariable Long temporadaId,
                                                  @AuthenticationPrincipal UsuarioAutenticado usuario) {
        habitacionService.eliminarTemporada(id, temporadaId, usuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/bloqueos")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<BloqueoResponse> crearBloqueo(
            @PathVariable Long id,
            @Valid @RequestBody BloqueoRequest request,
            @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitacionService.crearBloqueo(id, request, usuario));
    }

    @DeleteMapping("/{id}/bloqueos/{bloqueoId}")
    @PreAuthorize("hasRole('DUENO')")
    public ResponseEntity<Void> eliminarBloqueo(@PathVariable Long id,
                                                @PathVariable Long bloqueoId,
                                                @AuthenticationPrincipal UsuarioAutenticado usuario) {
        habitacionService.eliminarBloqueo(id, bloqueoId, usuario);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/precio")
    public PrecioResponse precio(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return habitacionService.calcularPrecio(id, checkIn, checkOut);
    }

    @GetMapping("/{id}/disponibilidad")
    public DisponibilidadResponse disponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return habitacionService.disponibilidad(id, checkIn, checkOut);
    }
}
