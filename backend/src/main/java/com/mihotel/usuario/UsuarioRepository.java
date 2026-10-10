package com.mihotel.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRol(Rol rol);

    List<Usuario> findByRol(Rol rol);

    long countByRol(Rol rol);

    long countByActivoTrue();
}
