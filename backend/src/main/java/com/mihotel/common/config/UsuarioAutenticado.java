package com.mihotel.common.config;

import com.mihotel.usuario.Rol;
import com.mihotel.usuario.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;
import java.util.List;

public class UsuarioAutenticado extends User {

    private final Long id;
    private final Rol rol;

    public UsuarioAutenticado(Usuario usuario, Collection<? extends GrantedAuthority> authorities) {
        super(usuario.getEmail(), usuario.getPasswordHash(),
                usuario.isActivo(), true, true, true, authorities);
        this.id = usuario.getId();
        this.rol = usuario.getRol();
    }

    public static UsuarioAutenticado de(Usuario usuario) {
        return new UsuarioAutenticado(usuario,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
    }

    public Long getId() {
        return id;
    }

    public Rol getRol() {
        return rol;
    }
}
