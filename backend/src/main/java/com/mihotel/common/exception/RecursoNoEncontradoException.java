package com.mihotel.common.exception;

//Para cuando algo no existe (404)
public class RecursoNoEncontradoException extends RuntimeException{

    public RecursoNoEncontradoException(String mensaje){
        super(mensaje);
    }
}
