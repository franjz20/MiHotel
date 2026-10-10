package com.mihotel.auditoria;

import com.mihotel.usuario.Usuario;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
@Getter
@Setter
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private Usuario actor;

    private String actorEmail;

    @Column(nullable = false, length = 100)
    private String accion;

    @Column(length = 50)
    private String entidad;

    private Long entidadId;

    @Column(columnDefinition = "TEXT")
    private String detalle;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
