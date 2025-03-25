package com.example.demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Service.RunService;
import com.example.demo.dto.ResponseWrapper;  // Import ResponseWrapper

import lombok.Data;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // Adjust as per frontend URL
public class RunController {

    @Autowired
    private RunService runService;

    @PostMapping("/run")
    public ResponseWrapper<OutputResponse> runCode(@RequestBody CodeRequest request) {
        String code = request.getCode();
        String language = request.getLanguage();

        if (code == null || code.isEmpty() || language == null || language.isEmpty()) {
            OutputResponse errorResponse = new OutputResponse("Error: Code or language not provided");
            return new ResponseWrapper<>("error", "Code or language not provided", errorResponse);
        }

        try {
            String output = runService.executeCode(code, language);
            OutputResponse successResponse = new OutputResponse(output);
            return new ResponseWrapper<>("success", "Code executed successfully", successResponse);
        } catch (Exception e) {
            OutputResponse errorResponse = new OutputResponse("Error executing code: " + e.getMessage());
            return new ResponseWrapper<>("error", "Execution failed", errorResponse);
        }
    }

    @Data
    static class CodeRequest {
        private String code;
        private String language;
    }

    @Data
    static class OutputResponse {
        private final String output;
    }
}
