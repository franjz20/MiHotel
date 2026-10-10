package com.mihotel.notificacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findTop30ByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

    long countByUsuarioIdAndLeidaFalse(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndLeidaFalse(Long usuarioId);
}
