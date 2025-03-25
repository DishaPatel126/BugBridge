package com.example.demo.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ProtectedEndpoint {

    @GetMapping("/protected-endpoint")
    public String getProtectedData() {
        return "This is a protected resource. You have access!";
    }
}
