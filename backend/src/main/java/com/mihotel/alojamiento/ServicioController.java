package com.mihotel.alojamiento;

import com.mihotel.alojamiento.dto.ServicioResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    private final ServicioRepository servicioRepository;

    public ServicioController(ServicioRepository servicioRepository) {
        this.servicioRepository = servicioRepository;
    }

    @GetMapping
    public List<ServicioResponse> listar() {
        return servicioRepository.findAll().stream()
                .map(ServicioResponse::de)
                .toList();
    }
}
