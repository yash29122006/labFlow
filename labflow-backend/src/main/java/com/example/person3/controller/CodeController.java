package com.example.person3.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.person3.dto.CodeExecutionRequest;
import com.example.person3.service.CodeExecutionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/code")
@CrossOrigin
public class CodeController {

    private final CodeExecutionService codeExecutionService;

    public CodeController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeCode(
            @Valid @RequestBody CodeExecutionRequest request) {

        return ResponseEntity.ok(
                codeExecutionService.executeCode(request)
        );
    }
}