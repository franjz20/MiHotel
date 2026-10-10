package com.mihotel.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfirmacionTokenRepository extends JpaRepository<ConfirmacionToken, Long> {

    Optional<ConfirmacionToken> findByToken(String token);
}
