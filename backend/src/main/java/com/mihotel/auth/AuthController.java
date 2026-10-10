package com.mihotel.auth;

import com.mihotel.auth.dto.*;
import com.mihotel.usuario.Rol;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrarCliente(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registrar(request, Rol.CLIENTE));
    }

    @PostMapping("/registro-dueno")
    public ResponseEntity<AuthResponse> registrarDueno(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.registrar(request, Rol.DUENO));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/recuperar")
    public Map<String, String> recuperar(@Valid @RequestBody RecuperarRequest request) {
        String token = authService.generarTokenRecuperacion(request);
        // Respuesta generica: no revelar si el email existe.
        // En modo dev el token se devuelve aca (y en el log) hasta que haya envio de email.
        return token != null
                ? Map.of("mensaje", "Si el email existe, se genero un token de recuperacion", "tokenDev", token)
                : Map.of("mensaje", "Si el email existe, se genero un token de recuperacion");
    }

    @PostMapping("/confirmar-email")
    public Map<String, String> confirmarEmail(@RequestBody Map<String, String> body) {
        authService.confirmarEmail(body.get("token"));
        return Map.of("mensaje", "Email confirmado correctamente");
    }

    @PostMapping("/restablecer")
    public Map<String, String> restablecer(@Valid @RequestBody RestablecerRequest request) {
        authService.restablecerPassword(request);
        return Map.of("mensaje", "Contrasena actualizada correctamente");
    }
}
