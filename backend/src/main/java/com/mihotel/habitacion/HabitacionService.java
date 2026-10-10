package com.mihotel.habitacion;

import com.mihotel.alojamiento.Alojamiento;
import com.mihotel.alojamiento.AlojamientoService;
import com.mihotel.alojamiento.EstadoAlojamiento;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.common.exception.NegocioException;
import com.mihotel.common.exception.RecursoNoEncontradoException;
import com.mihotel.common.storage.StorageService;
import com.mihotel.habitacion.dto.*;
import com.mihotel.reserva.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class HabitacionService {

    private final HabitacionRepository habitacionRepository;
    private final TemporadaRepository temporadaRepository;
    private final HabitacionBloqueoRepository bloqueoRepository;
    private final ReservaRepository reservaRepository;
    private final AlojamientoService alojamientoService;
    private final StorageService storageService;

    public HabitacionService(HabitacionRepository habitacionRepository,
                             TemporadaRepository temporadaRepository,
                             HabitacionBloqueoRepository bloqueoRepository,
                             ReservaRepository reservaRepository,
                             AlojamientoService alojamientoService,
                             StorageService storageService) {
        this.habitacionRepository = habitacionRepository;
        this.temporadaRepository = temporadaRepository;
        this.bloqueoRepository = bloqueoRepository;
        this.reservaRepository = reservaRepository;
        this.alojamientoService = alojamientoService;
        this.storageService = storageService;
    }

    @Transactional
    public HabitacionResponse crear(Long alojamientoId, HabitacionRequest request,
                                    UsuarioAutenticado usuario) {
        Alojamiento alojamiento = alojamientoService.buscar(alojamientoId);
        alojamientoService.verificarDueno(alojamiento, usuario);

        Habitacion habitacion = new Habitacion();
        habitacion.setAlojamiento(alojamiento);
        aplicarDatos(habitacion, request);
        return HabitacionResponse.de(habitacionRepository.save(habitacion));
    }

    @Transactional(readOnly = true)
    public List<HabitacionResponse> listar(Long alojamientoId, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = alojamientoService.buscar(alojamientoId);
        if (alojamiento.getEstado() != EstadoAlojamiento.APROBADO) {
            alojamientoService.verificarDueno(alojamiento, usuario);
        }
        return habitacionRepository.findByAlojamientoIdAndActivaTrue(alojamientoId).stream()
                .map(HabitacionResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public HabitacionResponse detalle(Long id, UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        if (habitacion.getAlojamiento().getEstado() != EstadoAlojamiento.APROBADO) {
            alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        }
        return HabitacionResponse.de(habitacion);
    }

    @Transactional
    public HabitacionResponse editar(Long id, HabitacionRequest request,
                                     UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        aplicarDatos(habitacion, request);
        habitacion.setUpdatedAt(LocalDateTime.now());
        return HabitacionResponse.de(habitacionRepository.save(habitacion));
    }

    @Transactional
    public void eliminar(Long id, UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        habitacion.setActiva(false);
        habitacionRepository.save(habitacion);
    }

    @Transactional
    public FotoHabitacionResponse agregarFoto(Long id, MultipartFile archivo,
                                              UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        String url = storageService.subir(archivo, "habitaciones/" + id);

        HabitacionFoto foto = new HabitacionFoto();
        foto.setHabitacion(habitacion);
        foto.setUrl(url);
        foto.setOrden(habitacion.getFotos().size());
        habitacion.getFotos().add(foto);
        habitacionRepository.save(habitacion);
        return new FotoHabitacionResponse(foto.getId(), foto.getUrl());
    }

    @Transactional
    public void eliminarFoto(Long id, Long fotoId, UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        HabitacionFoto foto = habitacion.getFotos().stream()
                .filter(f -> f.getId().equals(fotoId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("Foto no encontrada"));
        storageService.eliminar(foto.getUrl());
        habitacion.getFotos().remove(foto);
        habitacionRepository.save(habitacion);
    }

    @Transactional
    public TemporadaResponse crearTemporada(Long id, TemporadaRequest request,
                                            UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        validarRango(request.fechaInicio(), request.fechaFin());

        if (!temporadaRepository.findSolapadas(id, request.fechaInicio(), request.fechaFin()).isEmpty()) {
            throw new NegocioException("La temporada se solapa con otra existente");
        }
        Temporada temporada = new Temporada();
        temporada.setHabitacion(habitacion);
        temporada.setNombre(request.nombre());
        temporada.setFechaInicio(request.fechaInicio());
        temporada.setFechaFin(request.fechaFin());
        temporada.setPrecioPorNoche(request.precioPorNoche());
        return TemporadaResponse.de(temporadaRepository.save(temporada));
    }

    @Transactional
    public void eliminarTemporada(Long id, Long temporadaId, UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        Temporada temporada = temporadaRepository.findById(temporadaId)
                .filter(t -> t.getHabitacion().getId().equals(id))
                .orElseThrow(() -> new RecursoNoEncontradoException("Temporada no encontrada"));
        temporadaRepository.delete(temporada);
    }

    @Transactional
    public BloqueoResponse crearBloqueo(Long id, BloqueoRequest request,
                                        UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        validarRango(request.fechaInicio(), request.fechaFin());

        HabitacionBloqueo bloqueo = new HabitacionBloqueo();
        bloqueo.setHabitacion(habitacion);
        bloqueo.setFechaInicio(request.fechaInicio());
        bloqueo.setFechaFin(request.fechaFin());
        bloqueo.setMotivo(request.motivo());
        return BloqueoResponse.de(bloqueoRepository.save(bloqueo));
    }

    @Transactional
    public void eliminarBloqueo(Long id, Long bloqueoId, UsuarioAutenticado usuario) {
        Habitacion habitacion = buscar(id);
        alojamientoService.verificarDueno(habitacion.getAlojamiento(), usuario);
        HabitacionBloqueo bloqueo = bloqueoRepository.findById(bloqueoId)
                .filter(b -> b.getHabitacion().getId().equals(id))
                .orElseThrow(() -> new RecursoNoEncontradoException("Bloqueo no encontrado"));
        bloqueoRepository.delete(bloqueo);
    }

    @Transactional(readOnly = true)
    public PrecioResponse calcularPrecio(Long id, LocalDate checkIn, LocalDate checkOut) {
        Habitacion habitacion = buscar(id);
        validarRango(checkIn, checkOut);

        List<Temporada> temporadas = temporadaRepository.findByHabitacionId(id);
        List<PrecioResponse.NochePrecio> noches = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (LocalDate noche = checkIn; noche.isBefore(checkOut); noche = noche.plusDays(1)) {
            final LocalDate fecha = noche;
            Temporada temporada = temporadas.stream()
                    .filter(t -> !fecha.isBefore(t.getFechaInicio()) && fecha.isBefore(t.getFechaFin()))
                    .findFirst()
                    .orElse(null);
            BigDecimal precio = temporada != null ? temporada.getPrecioPorNoche() : habitacion.getPrecioPorNoche();
            noches.add(new PrecioResponse.NochePrecio(fecha, precio,
                    temporada != null ? temporada.getNombre() : null));
            total = total.add(precio);
        }
        return new PrecioResponse(total, noches);
    }

    @Transactional(readOnly = true)
    public DisponibilidadResponse disponibilidad(Long id, LocalDate checkIn, LocalDate checkOut) {
        Habitacion habitacion = buscar(id);
        validarRango(checkIn, checkOut);

        if (!habitacion.isActiva()) {
            return new DisponibilidadResponse(false, 0, habitacion.getCantidad(), false);
        }
        boolean bloqueada = !bloqueoRepository.findSolapados(id, checkIn, checkOut).isEmpty();
        int reservadas = reservaRepository.unidadesReservadas(id, checkIn, checkOut);
        int libres = bloqueada ? 0 : habitacion.getCantidad() - reservadas;
        return new DisponibilidadResponse(libres > 0, libres, habitacion.getCantidad(), bloqueada);
    }

    public Habitacion buscar(Long id) {
        return habitacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Habitacion no encontrada"));
    }

    private void aplicarDatos(Habitacion h, HabitacionRequest r) {
        h.setNombre(r.nombre());
        h.setDescripcion(r.descripcion());
        h.setCapacidad(r.capacidad());
        h.setCantidad(r.cantidad());
        h.setPrecioPorNoche(r.precioPorNoche());
    }

    private void validarRango(LocalDate inicio, LocalDate fin) {
        if (inicio == null || fin == null || !inicio.isBefore(fin)) {
            throw new NegocioException("Rango de fechas invalido: el inicio debe ser anterior al fin");
        }
    }
}
