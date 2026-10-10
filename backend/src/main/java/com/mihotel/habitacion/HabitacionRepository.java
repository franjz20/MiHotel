package com.mihotel.habitacion;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitacionRepository extends JpaRepository<Habitacion, Long> {

    List<Habitacion> findByAlojamientoIdAndActivaTrue(Long alojamientoId);

    long countByAlojamientoIdAndActivaTrue(Long alojamientoId);
}
