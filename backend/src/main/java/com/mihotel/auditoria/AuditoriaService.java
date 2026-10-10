package com.mihotel.auditoria;

import com.mihotel.common.config.UsuarioAutenticado;
import com.mihotel.auditoria.dto.AuditoriaResponse;
import com.mihotel.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    public AuditoriaService(AuditoriaRepository auditoriaRepository,
                            UsuarioRepository usuarioRepository) {
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Registra una accion. actor puede ser null (acciones del sistema). */
    @Transactional
    public void registrar(UsuarioAutenticado actor, String accion,
                          String entidad, Long entidadId, String detalle) {
        Auditoria a = new Auditoria();
        if (actor != null) {
            a.setActor(usuarioRepository.getReferenceById(actor.getId()));
            a.setActorEmail(actor.getUsername());
        }
        a.setAccion(accion);
        a.setEntidad(entidad);
        a.setEntidadId(entidadId);
        a.setDetalle(detalle);
        auditoriaRepository.save(a);
    }

    @Transactional
    public void registrarSistema(String actorEmail, String accion,
                                 String entidad, Long entidadId, String detalle) {
        Auditoria a = new Auditoria();
        a.setActorEmail(actorEmail);
        a.setAccion(accion);
        a.setEntidad(entidad);
        a.setEntidadId(entidadId);
        a.setDetalle(detalle);
        auditoriaRepository.save(a);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponse> ultimas() {
        return auditoriaRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(AuditoriaResponse::de)
                .toList();
    }
}
