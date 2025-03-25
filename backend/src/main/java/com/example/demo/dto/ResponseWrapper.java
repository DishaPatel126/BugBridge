package com.example.demo.dto;

public class ResponseWrapper<T> {

    private String status;
    private String message;
    private T body;

    // Constructor
    public ResponseWrapper(String status, String message, T body) {
        this.status = status;
        this.message = message;
        this.body = body;
    }

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getBody() {
        return body;
    }

    public void setBody(T body) {
        this.body = body;
    }
}
