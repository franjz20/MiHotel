package com.mihotel.admin;

import com.mihotel.admin.dto.EstadisticasAdminResponse;
import com.mihotel.admin.dto.ReportesAdminResponse;
import com.mihotel.admin.dto.UsuarioAdminResponse;
import com.mihotel.alojamiento.AlojamientoRepository;
import com.mihotel.alojamiento.EstadoAlojamiento;
import com.mihotel.alojamiento.dto.AlojamientoResumenResponse;
import com.mihotel.auditoria.AuditoriaService;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.common.exception.NegocioException;
import com.mihotel.common.exception.RecursoNoEncontradoException;
import com.mihotel.common.mail.EmailService;
import com.mihotel.notificacion.NotificacionService;
import com.mihotel.reserva.EstadoReserva;
import com.mihotel.reserva.Reserva;
import com.mihotel.reserva.ReservaRepository;
import com.mihotel.reserva.dto.ReservaResponse;
import com.mihotel.usuario.Rol;
import com.mihotel.usuario.Usuario;
import com.mihotel.usuario.UsuarioRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final AlojamientoRepository alojamientoRepository;
    private final ReservaRepository reservaRepository;
    private final AuditoriaService auditoriaService;
    private final NotificacionService notificacionService;
    private final EmailService emailService;

    public AdminService(UsuarioRepository usuarioRepository,
                        AlojamientoRepository alojamientoRepository,
                        ReservaRepository reservaRepository,
                        AuditoriaService auditoriaService,
                        NotificacionService notificacionService,
                        EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.alojamientoRepository = alojamientoRepository;
        this.reservaRepository = reservaRepository;
        this.auditoriaService = auditoriaService;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
    }

    // ---- Gestion de usuarios ----

    @Transactional(readOnly = true)
    public List<UsuarioAdminResponse> listarUsuarios(Rol rol, String q) {
        List<Usuario> usuarios = rol != null
                ? usuarioRepository.findByRol(rol)
                : usuarioRepository.findAll();
        return usuarios.stream()
                .filter(u -> q == null || q.isBlank()
                        || u.getEmail().toLowerCase().contains(q.toLowerCase())
                        || (u.getNombre() + " " + u.getApellido()).toLowerCase().contains(q.toLowerCase()))
                .map(UsuarioAdminResponse::de)
                .toList();
    }

    @Transactional
    public UsuarioAdminResponse cambiarActivo(Long id, boolean activo, UsuarioAutenticado actor) {
        Usuario usuario = buscarUsuario(id);
        if (usuario.getId().equals(actor.getId())) {
            throw new NegocioException("No podes desactivar tu propia cuenta");
        }
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
        auditoriaService.registrar(actor, activo ? "USUARIO_ACTIVADO" : "USUARIO_DESACTIVADO",
                "USUARIO", id, usuario.getEmail());
        return UsuarioAdminResponse.de(usuario);
    }

    @Transactional
    public UsuarioAdminResponse cambiarRol(Long id, Rol rol, UsuarioAutenticado actor) {
        Usuario usuario = buscarUsuario(id);
        if (usuario.getId().equals(actor.getId())) {
            throw new NegocioException("No podes cambiar el rol de tu propia cuenta");
        }
        Rol anterior = usuario.getRol();
        usuario.setRol(rol);
        usuarioRepository.save(usuario);
        auditoriaService.registrar(actor, "USUARIO_ROL_CAMBIADO", "USUARIO", id,
                usuario.getEmail() + ": " + anterior + " -> " + rol);
        return UsuarioAdminResponse.de(usuario);
    }

    // ---- Gestion de reservas ----

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarReservas(EstadoReserva estado) {
        List<Reserva> reservas = estado != null
                ? reservaRepository.findByEstadoOrderByCreatedAtDesc(estado)
                : reservaRepository.findAllByOrderByCreatedAtDesc();
        return reservas.stream().map(ReservaResponse::de).toList();
    }

    @Transactional
    public ReservaResponse cancelarReserva(Long id, String motivo, UsuarioAutenticado actor) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada"));
        if (reserva.getEstado() != EstadoReserva.PENDIENTE
                && reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new NegocioException("Esta reserva ya no se puede cancelar");
        }
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setMotivoRechazo(motivo);
        reserva.setUpdatedAt(LocalDateTime.now());
        reservaRepository.save(reserva);

        auditoriaService.registrar(actor, "RESERVA_CANCELADA_ADMIN", "RESERVA", id,
                motivo != null ? motivo : "Sin motivo");

        var dueno = reserva.getHabitacion().getAlojamiento().getDueno();
        notificacionService.crear(dueno.getId(), "RESERVA",
                "Reserva cancelada por administracion",
                "La reserva #" + reserva.getId() + " fue cancelada por un administrador.");
        notificacionService.crear(reserva.getCliente().getId(), "RESERVA",
                "Tu reserva fue cancelada",
                "La reserva #" + reserva.getId() + " fue cancelada por administracion."
                        + (motivo != null ? " Motivo: " + motivo : ""));
        emailService.reservaCanceladaParaDueno(reserva);
        return ReservaResponse.de(reserva);
    }

    // ---- Estadisticas y reportes ----

    @Transactional(readOnly = true)
    public EstadisticasAdminResponse estadisticas() {
        Map<String, Long> porRol = new HashMap<>();
        for (Rol r : Rol.values()) {
            porRol.put(r.name(), usuarioRepository.countByRol(r));
        }
        Map<String, Long> alojPorEstado = new HashMap<>();
        for (EstadoAlojamiento e : EstadoAlojamiento.values()) {
            alojPorEstado.put(e.name(), alojamientoRepository.countByEstado(e));
        }
        Map<String, Long> resPorEstado = new HashMap<>();
        for (EstadoReserva e : EstadoReserva.values()) {
            resPorEstado.put(e.name(), reservaRepository.countByEstado(e));
        }
        return new EstadisticasAdminResponse(
                usuarioRepository.count(),
                usuarioRepository.countByActivoTrue(),
                porRol,
                alojamientoRepository.count(),
                alojPorEstado,
                reservaRepository.count(),
                resPorEstado,
                reservaRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(30)),
                reservaRepository.ingresosTotales());
    }

    @Transactional(readOnly = true)
    public ReportesAdminResponse reportes() {
        List<ReportesAdminResponse.MesReservas> porMes = reservaRepository.reservasPorMes().stream()
                .map(f -> new ReportesAdminResponse.MesReservas((String) f[0], ((Number) f[1]).longValue()))
                .toList();
        List<ReportesAdminResponse.TopAlojamiento> top = reservaRepository
                .topAlojamientos(PageRequest.of(0, 5)).stream()
                .map(f -> new ReportesAdminResponse.TopAlojamiento(
                        ((Number) f[0]).longValue(), (String) f[1], (String) f[2],
                        ((Number) f[3]).longValue(), (BigDecimal) f[4]))
                .toList();
        long total = reservaRepository.count();
        double tasaCancelacion = total == 0 ? 0
                : (double) reservaRepository.countByEstado(EstadoReserva.CANCELADA) / total * 100;
        double tasaRechazo = total == 0 ? 0
                : (double) reservaRepository.countByEstado(EstadoReserva.RECHAZADA) / total * 100;
        return new ReportesAdminResponse(porMes, top, tasaCancelacion, tasaRechazo);
    }

    @Transactional(readOnly = true)
    public List<AlojamientoResumenResponse> todosLosAlojamientos() {
        return alojamientoRepository.findAll().stream()
                .map(AlojamientoResumenResponse::de)
                .toList();
    }

    private Usuario buscarUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
