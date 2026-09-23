package com.example.person3.service;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.person3.client.Judge0Client;
import com.example.person3.dto.CodeExecutionRequest;

@Service
public class CodeExecutionService {

    private final Judge0Client judge0Client;

    public CodeExecutionService(Judge0Client judge0Client) {
        this.judge0Client = judge0Client;
    }

    public Map<String, Object> executeCode(
            CodeExecutionRequest request) {

        return judge0Client.execute(request);
    }
}