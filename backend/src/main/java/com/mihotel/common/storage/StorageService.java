package com.mihotel.common.storage;

import com.mihotel.common.exception.NegocioException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class StorageService {

    private static final long MAX_BYTES = 5 * 1024 * 1024;

    private final RestClient restClient;
    private final String bucket;
    private final String urlPublica;
    private final boolean configurado;

    public StorageService(@Value("${supabase.url}") String supabaseUrl,
                          @Value("${supabase.service-key}") String serviceKey,
                          @Value("${supabase.bucket}") String bucket) {
        this.bucket = bucket;
        this.configurado = !supabaseUrl.isBlank() && !serviceKey.isBlank();
        this.restClient = configurado
                ? RestClient.builder()
                        .baseUrl(supabaseUrl + "/storage/v1")
                        .defaultHeader("Authorization", "Bearer " + serviceKey)
                        .defaultHeader("apikey", serviceKey)
                        .build()
                : null;
        this.urlPublica = supabaseUrl + "/storage/v1/object/public/" + bucket + "/";
    }

    public String subir(MultipartFile archivo, String carpeta) {
        if (!configurado) {
            throw new NegocioException("El almacenamiento de fotos no esta configurado (faltan supabase.url/supabase.service-key)");
        }
        if (archivo.isEmpty() || archivo.getContentType() == null
                || !archivo.getContentType().startsWith("image/")) {
            throw new NegocioException("El archivo debe ser una imagen");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw new NegocioException("La imagen no puede superar los 5MB");
        }

        String extension = archivo.getOriginalFilename() != null
                && archivo.getOriginalFilename().contains(".")
                ? archivo.getOriginalFilename().substring(archivo.getOriginalFilename().lastIndexOf('.'))
                : ".jpg";
        String path = carpeta + "/" + UUID.randomUUID() + extension;

        try {
            restClient.post()
                    .uri("/object/{bucket}/{path}", bucket, path)
                    .contentType(MediaType.parseMediaType(archivo.getContentType()))
                    .header("x-upsert", "true")
                    .body(archivo.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException e) {
            throw new NegocioException("No se pudo leer el archivo");
        }
        return urlPublica + path;
    }

    public void eliminar(String url) {
        if (!configurado || url == null || !url.startsWith(urlPublica)) {
            return;
        }
        String path = url.substring(urlPublica.length());
        restClient.delete()
                .uri("/object/{bucket}/{path}", bucket, path)
                .retrieve()
                .toBodilessEntity();
    }
}
