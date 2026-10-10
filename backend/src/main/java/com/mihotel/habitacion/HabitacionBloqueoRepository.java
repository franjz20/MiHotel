package com.mihotel.habitacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface HabitacionBloqueoRepository extends JpaRepository<HabitacionBloqueo, Long> {

    List<HabitacionBloqueo> findByHabitacionId(Long habitacionId);

    @Query("SELECT b FROM HabitacionBloqueo b WHERE b.habitacion.id = :habitacionId " +
            "AND b.fechaInicio < :fechaFin AND b.fechaFin > :fechaInicio")
    List<HabitacionBloqueo> findSolapados(@Param("habitacionId") Long habitacionId,
                                          @Param("fechaInicio") LocalDate fechaInicio,
                                          @Param("fechaFin") LocalDate fechaFin);
}
