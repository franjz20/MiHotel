package com.mihotel.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.stream.Collectors;


//El interceptor
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ApiError> handleNotFound(RecursoNoEncontradoException ex){
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ApiError> handleNegocio(NegocioException ex){
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ApiError> handleAccesoDenegado(AccesoDenegadoException ex){
        return build(HttpStatus.FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleSpringDenied(AccessDeniedException ex){
        return build(HttpStatus.FORBIDDEN, "Acceso denegado: no tenes permisos para este recurso");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleCredenciales(BadCredentialsException ex){
        return build(HttpStatus.UNAUTHORIZED, "Email o contrasena incorrectos");
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiError> handleDesactivado(DisabledException ex){
        return build(HttpStatus.UNAUTHORIZED, "Tu cuenta esta desactivada. Contacta al administrador");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidacion(MethodArgumentNotValidException ex){
        String mensaje = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return build(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(Exception ex){
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor");
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String mensaje){
        return ResponseEntity.status(status)
                .body(new ApiError(status.value(), mensaje, LocalDateTime.now()));
    }
}
