package com.mihotel.alojamiento;

import com.mihotel.alojamiento.dto.*;
import com.mihotel.auditoria.AuditoriaService;
import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.common.exception.AccesoDenegadoException;
import com.mihotel.common.exception.NegocioException;
import com.mihotel.common.exception.RecursoNoEncontradoException;
import com.mihotel.common.mail.EmailService;
import com.mihotel.common.storage.StorageService;
import com.mihotel.notificacion.NotificacionService;
import com.mihotel.usuario.Rol;
import com.mihotel.usuario.Usuario;
import com.mihotel.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
public class AlojamientoService {

    private final AlojamientoRepository alojamientoRepository;
    private final ServicioRepository servicioRepository;
    private final UsuarioRepository usuarioRepository;
    private final StorageService storageService;
    private final NotificacionService notificacionService;
    private final EmailService emailService;
    private final AuditoriaService auditoriaService;

    public AlojamientoService(AlojamientoRepository alojamientoRepository,
                              ServicioRepository servicioRepository,
                              UsuarioRepository usuarioRepository,
                              StorageService storageService,
                              NotificacionService notificacionService,
                              EmailService emailService,
                              AuditoriaService auditoriaService) {
        this.alojamientoRepository = alojamientoRepository;
        this.servicioRepository = servicioRepository;
        this.usuarioRepository = usuarioRepository;
        this.storageService = storageService;
        this.notificacionService = notificacionService;
        this.emailService = emailService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public AlojamientoResponse crear(AlojamientoRequest request, Long duenoId) {
        Usuario dueno = usuarioRepository.findById(duenoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Alojamiento alojamiento = new Alojamiento();
        alojamiento.setDueno(dueno);
        aplicarDatos(alojamiento, request);
        alojamiento.setEstado(EstadoAlojamiento.PENDIENTE);
        return AlojamientoResponse.de(alojamientoRepository.save(alojamiento));
    }

    @Transactional
    public AlojamientoResponse editar(Long id, AlojamientoRequest request, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = buscar(id);
        verificarDueno(alojamiento, usuario);
        aplicarDatos(alojamiento, request);
        // Si estaba aprobado o rechazado, una edicion vuelve a revision del admin
        alojamiento.setEstado(EstadoAlojamiento.PENDIENTE);
        alojamiento.setMotivoRechazo(null);
        alojamiento.setUpdatedAt(LocalDateTime.now());
        return AlojamientoResponse.de(alojamientoRepository.save(alojamiento));
    }

    @Transactional(readOnly = true)
    public List<AlojamientoResumenResponse> listarPublicos(String ciudad, TipoAlojamiento tipo) {
        List<Alojamiento> resultado;
        if (ciudad != null && tipo != null) {
            resultado = alojamientoRepository
                    .findByEstadoAndCiudadContainingIgnoreCaseAndTipo(EstadoAlojamiento.APROBADO, ciudad, tipo);
        } else if (ciudad != null) {
            resultado = alojamientoRepository
                    .findByEstadoAndCiudadContainingIgnoreCase(EstadoAlojamiento.APROBADO, ciudad);
        } else if (tipo != null) {
            resultado = alojamientoRepository.findByEstadoAndTipo(EstadoAlojamiento.APROBADO, tipo);
        } else {
            resultado = alojamientoRepository.findByEstado(EstadoAlojamiento.APROBADO);
        }
        return resultado.stream().map(AlojamientoResumenResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<AlojamientoResumenResponse> listarMios(Long duenoId) {
        return alojamientoRepository.findByDuenoId(duenoId).stream()
                .map(AlojamientoResumenResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlojamientoResumenResponse> listarPendientes() {
        return alojamientoRepository.findByEstado(EstadoAlojamiento.PENDIENTE).stream()
                .map(AlojamientoResumenResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public AlojamientoResponse detalle(Long id, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = buscar(id);
        if (alojamiento.getEstado() != EstadoAlojamiento.APROBADO) {
            verificarDueno(alojamiento, usuario);
        }
        return AlojamientoResponse.de(alojamiento);
    }

    @Transactional
    public void eliminar(Long id, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = buscar(id);
        verificarDueno(alojamiento, usuario);
        alojamientoRepository.delete(alojamiento);
    }

    @Transactional
    public AlojamientoResponse cambiarEstado(Long id, EstadoAlojamiento estado, String motivo,
                                             UsuarioAutenticado actor) {
        Alojamiento alojamiento = buscar(id);
        alojamiento.setEstado(estado);
        alojamiento.setMotivoRechazo(estado == EstadoAlojamiento.APROBADO ? null : motivo);
        alojamiento.setUpdatedAt(LocalDateTime.now());
        Alojamiento guardado = alojamientoRepository.save(alojamiento);

        Usuario dueno = alojamiento.getDueno();
        notificacionService.crear(dueno.getId(), "ALOJAMIENTO",
                "Alojamiento " + estado.name().toLowerCase(),
                "Tu alojamiento " + alojamiento.getNombre() + " paso a estado " + estado
                        + (motivo != null ? ". Motivo: " + motivo : ""));
        emailService.alojamientoEstado(dueno, alojamiento.getNombre(), estado.name(), motivo);
        auditoriaService.registrar(actor, "ALOJAMIENTO_" + estado.name(),
                "ALOJAMIENTO", id, alojamiento.getNombre()
                        + (motivo != null ? " - " + motivo : ""));
        return AlojamientoResponse.de(guardado);
    }

    @Transactional
    public FotoResponse agregarFoto(Long id, MultipartFile archivo, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = buscar(id);
        verificarDueno(alojamiento, usuario);
        String url = storageService.subir(archivo, "alojamientos/" + id);

        AlojamientoFoto foto = new AlojamientoFoto();
        foto.setAlojamiento(alojamiento);
        foto.setUrl(url);
        foto.setOrden(alojamiento.getFotos().size());
        foto.setEsPortada(alojamiento.getFotos().isEmpty());
        alojamiento.getFotos().add(foto);
        alojamientoRepository.save(alojamiento);
        return new FotoResponse(foto.getId(), foto.getUrl(), foto.isEsPortada());
    }

    @Transactional
    public void eliminarFoto(Long id, Long fotoId, UsuarioAutenticado usuario) {
        Alojamiento alojamiento = buscar(id);
        verificarDueno(alojamiento, usuario);
        AlojamientoFoto foto = alojamiento.getFotos().stream()
                .filter(f -> f.getId().equals(fotoId))
                .findFirst()
                .orElseThrow(() -> new RecursoNoEncontradoException("Foto no encontrada"));
        storageService.eliminar(foto.getUrl());
        alojamiento.getFotos().remove(foto);
        alojamientoRepository.save(alojamiento);
    }

    public Alojamiento buscar(Long id) {
        return alojamientoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Alojamiento no encontrado"));
    }

    public void verificarDueno(Alojamiento alojamiento, UsuarioAutenticado usuario) {
        boolean esDueno = usuario != null && alojamiento.getDueno().getId().equals(usuario.getId());
        boolean esAdmin = usuario != null && usuario.getRol() == Rol.ADMIN;
        if (!esDueno && !esAdmin) {
            throw new AccesoDenegadoException("Este alojamiento no te pertenece");
        }
    }

    private void aplicarDatos(Alojamiento a, AlojamientoRequest r) {
        a.setNombre(r.nombre());
        a.setTipo(r.tipo());
        a.setDescripcion(r.descripcion());
        a.setDireccion(r.direccion());
        a.setCiudad(r.ciudad());
        a.setProvincia(r.provincia());
        if (r.pais() != null && !r.pais().isBlank()) {
            a.setPais(r.pais());
        }
        a.setLatitud(r.latitud());
        a.setLongitud(r.longitud());
        a.setTelefono(r.telefono());
        a.setEmailContacto(r.emailContacto());
        a.setServicios(resolverServicios(r.servicioIds()));
    }

    private java.util.Set<Servicio> resolverServicios(java.util.Set<Long> servicioIds) {
        if (servicioIds == null || servicioIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Servicio> servicios = servicioRepository.findAllById(servicioIds);
        if (servicios.size() != servicioIds.size()) {
            throw new NegocioException("Uno o mas servicios no existen");
        }
        return new HashSet<>(servicios);
    }
}
