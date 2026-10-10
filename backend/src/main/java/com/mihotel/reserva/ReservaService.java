package com.mihotel.reserva;

import com.mihotel.alojamiento.AlojamientoService;
import com.mihotel.alojamiento.EstadoAlojamiento;
import com.mihotel.auditoria.AuditoriaService;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.common.exception.AccesoDenegadoException;
import com.mihotel.common.exception.NegocioException;
import com.mihotel.common.exception.RecursoNoEncontradoException;
import com.mihotel.common.mail.EmailService;
import com.mihotel.habitacion.Habitacion;
import com.mihotel.habitacion.HabitacionRepository;
import com.mihotel.habitacion.HabitacionService;
import com.mihotel.habitacion.dto.DisponibilidadResponse;
import com.mihotel.notificacion.NotificacionService;
import com.mihotel.reserva.dto.EstadisticasResponse;
import com.mihotel.reserva.dto.ReservaRequest;
import com.mihotel.reserva.dto.ReservaResponse;
import com.mihotel.usuario.Usuario;
import com.mihotel.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final HabitacionService habitacionService;
    private final HabitacionRepository habitacionRepository;
    private final AlojamientoService alojamientoService;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final EmailService emailService;
    private final AuditoriaService auditoriaService;

    public ReservaService(ReservaRepository reservaRepository,
                          HabitacionService habitacionService,
                          HabitacionRepository habitacionRepository,
                          AlojamientoService alojamientoService,
                          UsuarioRepository usuarioRepository,
                          NotificacionService notificacionService,
                          EmailService emailService,
                          AuditoriaService auditoriaService) {
        this.reservaRepository = reservaRepository;
        this.habitacionService = habitacionService;
        this.habitacionRepository = habitacionRepository;
        this.alojamientoService = alojamientoService;
        this.usuarioRepository = usuarioRepository;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public ReservaResponse crear(ReservaRequest request, Long clienteId) {
        Habitacion habitacion = habitacionService.buscar(request.habitacionId());

        if (!habitacion.isActiva()) {
            throw new NegocioException("Esta habitacion no esta disponible");
        }
        if (habitacion.getAlojamiento().getEstado() != EstadoAlojamiento.APROBADO) {
            throw new NegocioException("Este alojamiento no esta disponible para reservas");
        }
        if (request.checkIn().isBefore(LocalDate.now())) {
            throw new NegocioException("El check-in no puede ser una fecha pasada");
        }
        if (!request.checkIn().isBefore(request.checkOut())) {
            throw new NegocioException("El check-out debe ser posterior al check-in");
        }

        // Prevencion de duplicados/sobre-reserva: consultar unidades libres reales
        DisponibilidadResponse disp = habitacionService.disponibilidad(
                habitacion.getId(), request.checkIn(), request.checkOut());
        if (request.cantidadUnidades() > disp.unidadesLibres()) {
            throw new NegocioException("No hay suficientes unidades libres en esas fechas"
                    + " (libres: " + disp.unidadesLibres() + ")");
        }

        Usuario cliente = usuarioRepository.findById(clienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        BigDecimal precioPorUnidad = habitacionService
                .calcularPrecio(habitacion.getId(), request.checkIn(), request.checkOut())
                .total();

        Reserva reserva = new Reserva();
        reserva.setHabitacion(habitacion);
        reserva.setCliente(cliente);
        reserva.setCheckIn(request.checkIn());
        reserva.setCheckOut(request.checkOut());
        reserva.setCantidadUnidades(request.cantidadUnidades());
        reserva.setHuespedNombre(request.huespedNombre());
        reserva.setHuespedTelefono(request.huespedTelefono());
        reserva.setHuespedEmail(request.huespedEmail());
        reserva.setPrecioTotal(precioPorUnidad.multiply(BigDecimal.valueOf(request.cantidadUnidades())));
        reserva.setEstado(EstadoReserva.PENDIENTE);
        Reserva guardada = reservaRepository.save(reserva);

        Usuario dueno = habitacion.getAlojamiento().getDueno();
        notificacionService.crear(dueno.getId(), "RESERVA", "Nueva reserva pendiente",
                "Reserva #" + guardada.getId() + " en " + habitacion.getAlojamiento().getNombre()
                        + " (" + request.checkIn() + " a " + request.checkOut() + ")");
        emailService.nuevaReservaParaDueno(guardada);
        emailService.reservaCreadaParaCliente(guardada);
        auditoriaService.registrarSistema(cliente.getEmail(), "RESERVA_CREADA",
                "RESERVA", guardada.getId(), "Alojamiento: " + habitacion.getAlojamiento().getNombre());
        return ReservaResponse.de(guardada);
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> mias(Long clienteId) {
        return reservaRepository.findByClienteIdOrderByCreatedAtDesc(clienteId).stream()
                .map(ReservaResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarPorAlojamiento(Long alojamientoId, UsuarioAutenticado usuario) {
        alojamientoService.verificarDueno(alojamientoService.buscar(alojamientoId), usuario);
        return reservaRepository.findByHabitacionAlojamientoIdOrderByCreatedAtDesc(alojamientoId).stream()
                .map(ReservaResponse::de)
                .toList();
    }

    @Transactional
    public ReservaResponse confirmar(Long id, UsuarioAutenticado usuario) {
        Reserva reserva = buscarConDueno(id, usuario);
        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new NegocioException("Solo se pueden confirmar reservas pendientes");
        }
        // Re-chequeo: si otra reserva ocupo las unidades mientras tanto, hay sobre-reserva
        DisponibilidadResponse disp = habitacionService.disponibilidad(
                reserva.getHabitacion().getId(), reserva.getCheckIn(), reserva.getCheckOut());
        if (disp.unidadesLibres() < 0) {
            throw new NegocioException("Conflicto: ya no hay unidades libres en esas fechas");
        }
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setUpdatedAt(LocalDateTime.now());
        Reserva guardada = reservaRepository.save(reserva);
        notificacionService.crear(reserva.getCliente().getId(), "RESERVA", "Reserva confirmada",
                "Tu reserva #" + reserva.getId() + " en "
                        + reserva.getHabitacion().getAlojamiento().getNombre() + " fue confirmada");
        emailService.reservaConfirmada(reserva);
        auditoriaService.registrar(usuario, "RESERVA_CONFIRMADA", "RESERVA", reserva.getId(), null);
        return ReservaResponse.de(guardada);
    }

    @Transactional
    public ReservaResponse rechazar(Long id, String motivo, UsuarioAutenticado usuario) {
        Reserva reserva = buscarConDueno(id, usuario);
        if (reserva.getEstado() != EstadoReserva.PENDIENTE) {
            throw new NegocioException("Solo se pueden rechazar reservas pendientes");
        }
        reserva.setEstado(EstadoReserva.RECHAZADA);
        reserva.setMotivoRechazo(motivo);
        reserva.setUpdatedAt(LocalDateTime.now());
        Reserva guardada = reservaRepository.save(reserva);
        notificacionService.crear(reserva.getCliente().getId(), "RESERVA", "Reserva rechazada",
                "Tu reserva #" + reserva.getId() + " fue rechazada"
                        + (motivo != null ? ". Motivo: " + motivo : ""));
        emailService.reservaRechazada(reserva);
        auditoriaService.registrar(usuario, "RESERVA_RECHAZADA", "RESERVA", reserva.getId(), motivo);
        return ReservaResponse.de(guardada);
    }

    @Transactional
    public ReservaResponse completar(Long id, UsuarioAutenticado usuario) {
        Reserva reserva = buscarConDueno(id, usuario);
        if (reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new NegocioException("Solo se pueden completar reservas confirmadas");
        }
        reserva.setEstado(EstadoReserva.COMPLETADA);
        reserva.setUpdatedAt(LocalDateTime.now());
        Reserva guardada = reservaRepository.save(reserva);
        notificacionService.crear(reserva.getCliente().getId(), "RESERVA", "Estadia completada",
                "Tu reserva #" + reserva.getId() + " fue marcada como completada");
        auditoriaService.registrar(usuario, "RESERVA_COMPLETADA", "RESERVA", reserva.getId(), null);
        return ReservaResponse.de(guardada);
    }

    @Transactional
    public ReservaResponse cancelar(Long id, Long clienteId) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada"));
        if (!reserva.getCliente().getId().equals(clienteId)) {
            throw new AccesoDenegadoException("Esta reserva no te pertenece");
        }
        if (reserva.getEstado() != EstadoReserva.PENDIENTE
                && reserva.getEstado() != EstadoReserva.CONFIRMADA) {
            throw new NegocioException("Esta reserva ya no se puede cancelar");
        }
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setUpdatedAt(LocalDateTime.now());
        Reserva guardada = reservaRepository.save(reserva);
        Usuario dueno = reserva.getHabitacion().getAlojamiento().getDueno();
        notificacionService.crear(dueno.getId(), "RESERVA", "Reserva cancelada",
                "El cliente cancelo la reserva #" + reserva.getId());
        emailService.reservaCanceladaParaDueno(reserva);
        auditoriaService.registrarSistema(reserva.getCliente().getEmail(),
                "RESERVA_CANCELADA", "RESERVA", reserva.getId(), "Cancelada por el cliente");
        return ReservaResponse.de(guardada);
    }

    @Transactional(readOnly = true)
    public EstadisticasResponse estadisticas(Long alojamientoId, UsuarioAutenticado usuario) {
        alojamientoService.verificarDueno(alojamientoService.buscar(alojamientoId), usuario);

        Map<String, Long> porEstado = new HashMap<>();
        for (EstadoReserva e : EstadoReserva.values()) {
            porEstado.put(e.name(), reservaRepository.countByHabitacionAlojamientoIdAndEstado(alojamientoId, e));
        }
        return new EstadisticasResponse(
                reservaRepository.countByHabitacionAlojamientoId(alojamientoId),
                reservaRepository.reservasProximas(alojamientoId, LocalDate.now()),
                porEstado.get("PENDIENTE"),
                porEstado.get("CONFIRMADA"),
                habitacionRepository.countByAlojamientoIdAndActivaTrue(alojamientoId),
                reservaRepository.ingresosConfirmados(alojamientoId),
                porEstado);
    }

    private Reserva buscarConDueno(Long id, UsuarioAutenticado usuario) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Reserva no encontrada"));
        alojamientoService.verificarDueno(reserva.getHabitacion().getAlojamiento(), usuario);
        return reserva;
    }
}
