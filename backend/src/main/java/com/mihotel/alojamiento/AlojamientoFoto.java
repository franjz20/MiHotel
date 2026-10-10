package com.mihotel.alojamiento;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "alojamiento_fotos")
@Getter
@Setter
public class AlojamientoFoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alojamiento_id")
    private Alojamiento alojamiento;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(nullable = false)
    private int orden = 0;

    @Column(nullable = false)
    private boolean esPortada = false;
}
