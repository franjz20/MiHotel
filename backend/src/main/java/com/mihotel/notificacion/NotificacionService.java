package com.mihotel.notificacion;

import com.mihotel.common.exception.RecursoNoEncontradoException;
import com.mihotel.notificacion.dto.NotificacionResponse;
import com.mihotel.usuario.Usuario;
import com.mihotel.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(NotificacionRepository notificacionRepository,
                               UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void crear(Long usuarioId, String tipo, String titulo, String mensaje) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        Notificacion n = new Notificacion();
        n.setUsuario(usuario);
        n.setTipo(tipo);
        n.setTitulo(titulo);
        n.setMensaje(mensaje);
        notificacionRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> mias(Long usuarioId) {
        return notificacionRepository.findTop30ByUsuarioIdOrderByCreatedAtDesc(usuarioId).stream()
                .map(NotificacionResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public long noLeidas(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuarioId);
    }

    @Transactional
    public void marcarLeida(Long id, Long usuarioId) {
        Notificacion n = notificacionRepository.findById(id)
                .filter(x -> x.getUsuario().getId().equals(usuarioId))
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificacion no encontrada"));
        n.setLeida(true);
        notificacionRepository.save(n);
    }

    @Transactional
    public void marcarTodasLeidas(Long usuarioId) {
        notificacionRepository.findByUsuarioIdAndLeidaFalse(usuarioId)
                .forEach(n -> n.setLeida(true));
    }
}
