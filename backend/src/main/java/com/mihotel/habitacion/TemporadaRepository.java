package com.mihotel.habitacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TemporadaRepository extends JpaRepository<Temporada, Long> {

    List<Temporada> findByHabitacionId(Long habitacionId);

    @Query("SELECT t FROM Temporada t WHERE t.habitacion.id = :habitacionId " +
            "AND t.fechaInicio <= :fechaFin AND t.fechaFin > :fechaInicio")
    List<Temporada> findSolapadas(@Param("habitacionId") Long habitacionId,
                                  @Param("fechaInicio") LocalDate fechaInicio,
                                  @Param("fechaFin") LocalDate fechaFin);
}
