package com.mihotel.admin.dto;

import com.mihotel.usuario.Rol;
import jakarta.validation.constraints.NotNull;

public record CambiarRolRequest(@NotNull Rol rol) {
}
