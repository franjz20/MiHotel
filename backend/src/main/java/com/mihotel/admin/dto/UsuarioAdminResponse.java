package com.mihotel.admin.dto;

import com.mihotel.usuario.Rol;
import com.mihotel.usuario.Usuario;

import java.time.LocalDateTime;

public record UsuarioAdminResponse(
        Long id,
        String email,
        String nombre,
        String apellido,
        String telefono,
        Rol rol,
        boolean activo,
        boolean emailConfirmado,
        LocalDateTime createdAt
) {
    public static UsuarioAdminResponse de(Usuario u) {
        return new UsuarioAdminResponse(u.getId(), u.getEmail(), u.getNombre(), u.getApellido(),
                u.getTelefono(), u.getRol(), u.isActivo(), u.isEmailConfirmado(), u.getCreatedAt());
    }
}
