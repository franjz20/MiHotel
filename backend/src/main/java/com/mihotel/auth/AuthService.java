package com.mihotel.auth;

import com.mihotel.auditoria.AuditoriaService;
import com.mihotel.auth.dto.*;
import com.mihotel.common.exception.NegocioException;
import com.mihotel.common.mail.EmailService;
import com.mihotel.usuario.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MINUTOS_EXPIRACION_TOKEN = 60;
    private static final int HORAS_EXPIRACION_CONFIRMACION = 24;

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final ConfirmacionTokenRepository confirmacionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final AuditoriaService auditoriaService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordResetTokenRepository tokenRepository,
                       ConfirmacionTokenRepository confirmacionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager,
                       EmailService emailService,
                       AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.confirmacionRepository = confirmacionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.auditoriaService = auditoriaService;
    }

    @Transactional
    public AuthResponse registrar(RegistroRequest request, Rol rol) {
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new NegocioException("Ya existe una cuenta con ese email");
        }
        Usuario usuario = new Usuario();
        usuario.setEmail(request.email());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setTelefono(request.telefono());
        usuario.setRol(rol);
        usuarioRepository.save(usuario);

        String token = UUID.randomUUID().toString().replace("-", "");
        ConfirmacionToken confirmacion = new ConfirmacionToken();
        confirmacion.setUsuario(usuario);
        confirmacion.setToken(token);
        confirmacion.setExpiraEn(LocalDateTime.now().plusHours(HORAS_EXPIRACION_CONFIRMACION));
        confirmacionRepository.save(confirmacion);
        emailService.bienvenida(usuario, token);
        auditoriaService.registrarSistema(usuario.getEmail(), "USUARIO_REGISTRADO",
                "USUARIO", usuario.getId(), "Rol: " + rol);

        return new AuthResponse(jwtService.generarToken(usuario),
                usuario.getEmail(), usuario.getNombre(), usuario.getRol().name());
    }

    @Transactional
    public void confirmarEmail(String tokenValor) {
        ConfirmacionToken token = confirmacionRepository.findByToken(tokenValor)
                .filter(t -> !t.isUsado())
                .filter(t -> t.getExpiraEn().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new NegocioException("El enlace de confirmacion es invalido o ya expiro"));
        Usuario usuario = token.getUsuario();
        usuario.setEmailConfirmado(true);
        usuarioRepository.save(usuario);
        token.setUsado(true);
        confirmacionRepository.save(token);
        auditoriaService.registrarSistema(usuario.getEmail(), "EMAIL_CONFIRMADO",
                "USUARIO", usuario.getId(), null);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        Usuario usuario = usuarioRepository.findByEmail(request.email()).orElseThrow();
        return new AuthResponse(jwtService.generarToken(usuario),
                usuario.getEmail(), usuario.getNombre(), usuario.getRol().name());
    }

    @Transactional
    public String generarTokenRecuperacion(RecuperarRequest request) {
        return usuarioRepository.findByEmail(request.email())
                .map(usuario -> {
                    PasswordResetToken token = new PasswordResetToken();
                    token.setUsuario(usuario);
                    token.setToken(UUID.randomUUID().toString().replace("-", ""));
                    token.setExpiraEn(LocalDateTime.now().plusMinutes(MINUTOS_EXPIRACION_TOKEN));
                    tokenRepository.save(token);
                    emailService.recuperarPassword(usuario.getEmail(), token.getToken());
                    // En modo dev (sin SMTP) el token sigue volviendo en la respuesta para poder probar
                    return emailService.smtpConfigurado() ? null : token.getToken();
                })
                .orElse(null);
    }

    @Transactional
    public void restablecerPassword(RestablecerRequest request) {
        PasswordResetToken token = tokenRepository.findByToken(request.token())
                .filter(t -> !t.isUsado())
                .filter(t -> t.getExpiraEn().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new NegocioException("El token es invalido o ya expiro"));

        Usuario usuario = token.getUsuario();
        usuario.setPasswordHash(passwordEncoder.encode(request.nuevaPassword()));
        usuarioRepository.save(usuario);
        token.setUsado(true);
        tokenRepository.save(token);
    }
}
