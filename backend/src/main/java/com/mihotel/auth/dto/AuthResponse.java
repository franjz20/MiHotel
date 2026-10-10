package com.mihotel.auth.dto;

public record AuthResponse(
        String token,
        String email,
        String nombre,
        String rol
) {}
