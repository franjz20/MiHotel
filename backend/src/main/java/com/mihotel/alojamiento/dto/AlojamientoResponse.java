package com.mihotel.alojamiento.dto;

import com.mihotel.alojamiento.Alojamiento;
import com.mihotel.alojamiento.EstadoAlojamiento;
import com.mihotel.alojamiento.TipoAlojamiento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AlojamientoResponse(
        Long id,
        String nombre,
        TipoAlojamiento tipo,
        String descripcion,
        String direccion,
        String ciudad,
        String provincia,
        String pais,
        BigDecimal latitud,
        BigDecimal longitud,
        String telefono,
        String emailContacto,
        EstadoAlojamiento estado,
        String motivoRechazo,
        List<ServicioResponse> servicios,
        List<FotoResponse> fotos,
        LocalDateTime createdAt
) {
    public static AlojamientoResponse de(Alojamiento a) {
        return new AlojamientoResponse(
                a.getId(), a.getNombre(), a.getTipo(), a.getDescripcion(),
                a.getDireccion(), a.getCiudad(), a.getProvincia(), a.getPais(),
                a.getLatitud(), a.getLongitud(), a.getTelefono(), a.getEmailContacto(),
                a.getEstado(), a.getMotivoRechazo(),
                a.getServicios().stream().map(ServicioResponse::de).toList(),
                a.getFotos().stream()
                        .map(f -> new FotoResponse(f.getId(), f.getUrl(), f.isEsPortada()))
                        .toList(),
                a.getCreatedAt());
    }
}
