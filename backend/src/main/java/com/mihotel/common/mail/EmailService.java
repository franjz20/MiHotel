package com.mihotel.common.mail;

import com.mihotel.reserva.Reserva;
import com.mihotel.usuario.Usuario;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;

/**
 * Envio de emails transaccionales.
 * Si spring.mail.host esta configurado, envia por SMTP.
 * Si no, modo dev: el contenido del email se loguea en consola.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final String from;
    private final String frontendUrl;
    private final String mailHost;

    public EmailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                        @Value("${app.mail.from:noreply@mihotel.com}") String from,
                        @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl,
                        @Value("${spring.mail.host:}") String mailHost) {
        this.mailSenderProvider = mailSenderProvider;
        this.from = from;
        this.frontendUrl = frontendUrl;
        this.mailHost = mailHost;
    }

    /** true si hay SMTP real configurado (no modo dev). */
    public boolean smtpConfigurado() {
        return mailSenderProvider.getIfAvailable() != null && StringUtils.hasText(mailHost);
    }

    public void enviar(String para, String asunto, String cuerpoHtml) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || !StringUtils.hasText(mailHost)) {
            log.info("[EMAIL-DEV] Para: {} | Asunto: {}\n{}", para, asunto, cuerpoHtml);
            return;
        }
        try {
            MimeMessage mensaje = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, "UTF-8");
            helper.setFrom(from);
            helper.setTo(para);
            helper.setSubject(asunto);
            helper.setText(cuerpoHtml, true);
            sender.send(mensaje);
        } catch (Exception e) {
            // Un email fallido no debe romper el flujo de negocio
            log.error("No se pudo enviar email a {}: {}", para, e.getMessage());
        }
    }

    // ---- Plantillas ----

    private String plantilla(String titulo, String contenido) {
        return """
                <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;
                            border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
                  <div style="background:#1d4ed8;color:#fff;padding:16px 24px">
                    <h1 style="margin:0;font-size:20px">MiHotel</h1>
                  </div>
                  <div style="padding:24px;color:#111827">
                    <h2 style="margin-top:0;font-size:17px">%s</h2>
                    %s
                  </div>
                  <div style="padding:16px 24px;background:#f9fafb;color:#6b7280;font-size:12px">
                    Este es un mensaje automatico de MiHotel, no responder.
                  </div>
                </div>
                """.formatted(titulo, contenido);
    }

    private String boton(String url, String texto) {
        return """
                <p style="margin:24px 0">
                  <a href="%s" style="background:#1d4ed8;color:#fff;padding:10px 20px;
                     border-radius:6px;text-decoration:none">%s</a>
                </p>
                """.formatted(url, texto);
    }

    private String linkConfirmacion(String token) {
        return frontendUrl + "/confirmar-email?token=" + token;
    }

    // ---- Emails concretos ----

    public void bienvenida(Usuario usuario, String tokenConfirmacion) {
        String contenido = "<p>Hola " + usuario.getNombre() + ",</p>"
                + "<p>Tu cuenta en <b>MiHotel</b> fue creada correctamente. "
                + "Confirmá tu email para activar todas las funciones:</p>"
                + boton(linkConfirmacion(tokenConfirmacion), "Confirmar mi email");
        enviar(usuario.getEmail(), "Bienvenido a MiHotel - Confirma tu cuenta",
                plantilla("Cuenta creada", contenido));
    }

    public void recuperarPassword(String email, String token) {
        String link = frontendUrl + "/restablecer?token=" + token;
        String contenido = "<p>Recibimos un pedido para restablecer tu contrasena.</p>"
                + "<p>Si no fuiste vos, ignorá este mensaje.</p>"
                + boton(link, "Restablecer contrasena");
        enviar(email, "MiHotel - Recuperar contrasena", plantilla("Recuperar contrasena", contenido));
    }

    public void nuevaReservaParaDueno(Reserva r) {
        var alojamiento = r.getHabitacion().getAlojamiento();
        String contenido = "<p>Recibiste una nueva reserva en <b>" + alojamiento.getNombre() + "</b>:</p>"
                + detalleReserva(r)
                + "<p>Entrá al panel para confirmarla o rechazarla.</p>"
                + boton(frontendUrl + "/panel/alojamiento/" + alojamiento.getId(), "Ver reserva");
        enviar(alojamiento.getDueno().getEmail(), "MiHotel - Nueva reserva pendiente",
                plantilla("Nueva reserva en " + alojamiento.getNombre(), contenido));
    }

    public void reservaCreadaParaCliente(Reserva r) {
        String contenido = "<p>Tu reserva fue registrada y esta <b>pendiente de confirmacion</b> "
                + "por el alojamiento:</p>" + detalleReserva(r);
        enviar(r.getCliente().getEmail(), "MiHotel - Reserva recibida",
                plantilla("Reserva pendiente", contenido));
    }

    public void reservaConfirmada(Reserva r) {
        String contenido = "<p>El alojamiento <b>confirmó</b> tu reserva:</p>" + detalleReserva(r);
        enviar(r.getCliente().getEmail(), "MiHotel - Reserva confirmada",
                plantilla("Reserva confirmada", contenido));
    }

    public void reservaRechazada(Reserva r) {
        String motivo = r.getMotivoRechazo() != null ? "<p>Motivo: " + r.getMotivoRechazo() + "</p>" : "";
        String contenido = "<p>El alojamiento <b>rechazó</b> tu reserva:</p>" + detalleReserva(r) + motivo;
        enviar(r.getCliente().getEmail(), "MiHotel - Reserva rechazada",
                plantilla("Reserva rechazada", contenido));
    }

    public void reservaCanceladaParaCliente(Reserva r, String motivo) {
        String extra = motivo != null && !motivo.isBlank() ? "<p>Motivo: " + motivo + "</p>" : "";
        String contenido = "<p>Tu reserva fue <b>cancelada</b>:</p>" + detalleReserva(r) + extra;
        enviar(r.getCliente().getEmail(), "MiHotel - Reserva cancelada",
                plantilla("Reserva cancelada", contenido));
    }

    public void reservaCanceladaParaDueno(Reserva r) {
        var alojamiento = r.getHabitacion().getAlojamiento();
        String contenido = "<p>Se <b>canceló</b> una reserva en <b>" + alojamiento.getNombre() + "</b>:</p>"
                + detalleReserva(r);
        enviar(alojamiento.getDueno().getEmail(), "MiHotel - Reserva cancelada",
                plantilla("Reserva cancelada", contenido));
    }

    public void alojamientoEstado(Usuario dueno, String nombreAlojamiento, String estado, String motivo) {
        String extra = motivo != null && !motivo.isBlank() ? "<p>Motivo: " + motivo + "</p>" : "";
        String contenido = "<p>Tu alojamiento <b>" + nombreAlojamiento + "</b> cambio de estado a <b>"
                + estado + "</b>.</p>" + extra;
        enviar(dueno.getEmail(), "MiHotel - Estado de tu alojamiento",
                plantilla("Alojamiento " + estado.toLowerCase(), contenido));
    }

    private String detalleReserva(Reserva r) {
        var a = r.getHabitacion().getAlojamiento();
        return """
                <table style="border-collapse:collapse;margin:12px 0">
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Alojamiento</td><td><b>%s</b></td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Habitacion</td><td>%s</td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Check-in</td><td>%s</td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Check-out</td><td>%s</td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Huesped</td><td>%s</td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Unidades</td><td>%d</td></tr>
                  <tr><td style="padding:4px 16px 4px 0;color:#6b7280">Total</td><td><b>$%s</b></td></tr>
                </table>
                """.formatted(a.getNombre(), r.getHabitacion().getNombre(),
                r.getCheckIn().format(FMT), r.getCheckOut().format(FMT),
                r.getHuespedNombre(), r.getCantidadUnidades(), r.getPrecioTotal().toPlainString());
    }
}
