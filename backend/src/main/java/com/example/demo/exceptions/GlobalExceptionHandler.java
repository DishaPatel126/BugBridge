package com.example.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.demo.dto.ResponseWrapper;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseWrapper<String>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException ex) {
        // Creating a custom exception response for unsupported methods
        ResponseWrapper<String> responseWrapper = new ResponseWrapper<>(
                "error",                   // status
                "Method Not Allowed",      // message
                "Request method '" + ex.getMethod() + "' is not supported"  // body: method not allowed error message
        );
        
        return new ResponseEntity<>(responseWrapper, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ResponseWrapper<String>> handleAppException(AppException ex) {
        // Handling custom AppException
        ResponseWrapper<String> responseWrapper = new ResponseWrapper<>(
                "error",                   // status
                "App Exception",           // message
                ex.getMessage()            // body: custom exception message
        );
        
        return new ResponseEntity<>(responseWrapper, ex.getStatus());
    }
}
