package com.mihotel.common.exception;

import java.time.LocalDateTime;

//Esto sera el formato de respuesta de error (un record)
public record ApiError (
    int status,
    String message,
    LocalDateTime timestamp
) {}
