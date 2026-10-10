package com.mihotel.common.exception;

//Para violaciones de reglas de negocio (409) - "La habitacion ya esta reservada"
public class NegocioException extends RuntimeException{

    public NegocioException(String mensaje){
        super(mensaje);
    }
}
