package com.mihotel.usuario;

public record UsuarioResponse(
        Long id,
        String email,
        String nombre,
        String apellido,
        String telefono,
        Rol rol
) {
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getEmail(), u.getNombre(),
                u.getApellido(), u.getTelefono(), u.getRol());
    }
}
