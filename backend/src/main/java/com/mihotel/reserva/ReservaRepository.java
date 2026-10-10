package com.mihotel.reserva;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByClienteIdOrderByCreatedAtDesc(Long clienteId);

    List<Reserva> findByHabitacionAlojamientoIdOrderByCreatedAtDesc(Long alojamientoId);

    long countByHabitacionAlojamientoId(Long alojamientoId);

    long countByHabitacionAlojamientoIdAndEstado(Long alojamientoId, EstadoReserva estado);

    @Query("SELECT COALESCE(SUM(r.cantidadUnidades), 0) FROM Reserva r " +
            "WHERE r.habitacion.id = :habitacionId " +
            "AND r.estado IN ('PENDIENTE', 'CONFIRMADA') " +
            "AND r.checkIn < :checkOut AND r.checkOut > :checkIn")
    int unidadesReservadas(@Param("habitacionId") Long habitacionId,
                           @Param("checkIn") LocalDate checkIn,
                           @Param("checkOut") LocalDate checkOut);

    @Query("SELECT COALESCE(SUM(r.precioTotal), 0) FROM Reserva r " +
            "WHERE r.habitacion.alojamiento.id = :alojamientoId " +
            "AND r.estado IN ('CONFIRMADA', 'COMPLETADA')")
    java.math.BigDecimal ingresosConfirmados(@Param("alojamientoId") Long alojamientoId);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.habitacion.alojamiento.id = :alojamientoId " +
            "AND r.estado IN ('PENDIENTE', 'CONFIRMADA') AND r.checkIn >= :hoy")
    long reservasProximas(@Param("alojamientoId") Long alojamientoId, @Param("hoy") LocalDate hoy);

    // ---- Consultas para el panel de administrador ----

    List<Reserva> findAllByOrderByCreatedAtDesc();

    List<Reserva> findByEstadoOrderByCreatedAtDesc(EstadoReserva estado);

    long countByEstado(EstadoReserva estado);

    long countByCreatedAtAfter(LocalDateTime desde);

    @Query("SELECT COALESCE(SUM(r.precioTotal), 0) FROM Reserva r " +
            "WHERE r.estado IN ('CONFIRMADA', 'COMPLETADA')")
    java.math.BigDecimal ingresosTotales();

    @Query("SELECT FUNCTION('to_char', r.createdAt, 'YYYY-MM') AS mes, COUNT(r) " +
            "FROM Reserva r GROUP BY FUNCTION('to_char', r.createdAt, 'YYYY-MM') ORDER BY mes")
    List<Object[]> reservasPorMes();

    @Query("SELECT r.habitacion.alojamiento.id, r.habitacion.alojamiento.nombre, " +
            "r.habitacion.alojamiento.ciudad, COUNT(r), COALESCE(SUM(r.precioTotal), 0) " +
            "FROM Reserva r WHERE r.estado IN ('CONFIRMADA', 'COMPLETADA') " +
            "GROUP BY r.habitacion.alojamiento.id, r.habitacion.alojamiento.nombre, " +
            "r.habitacion.alojamiento.ciudad ORDER BY COUNT(r) DESC")
    List<Object[]> topAlojamientos(org.springframework.data.domain.Pageable pageable);
}
