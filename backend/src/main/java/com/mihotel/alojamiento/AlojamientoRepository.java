package com.mihotel.alojamiento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlojamientoRepository extends JpaRepository<Alojamiento, Long> {

    List<Alojamiento> findByEstado(EstadoAlojamiento estado);

    List<Alojamiento> findByDuenoId(Long duenoId);

    List<Alojamiento> findByEstadoAndCiudadContainingIgnoreCase(EstadoAlojamiento estado, String ciudad);

    List<Alojamiento> findByEstadoAndTipo(EstadoAlojamiento estado, TipoAlojamiento tipo);

    List<Alojamiento> findByEstadoAndCiudadContainingIgnoreCaseAndTipo(
            EstadoAlojamiento estado, String ciudad, TipoAlojamiento tipo);

    long countByEstado(EstadoAlojamiento estado);
}
