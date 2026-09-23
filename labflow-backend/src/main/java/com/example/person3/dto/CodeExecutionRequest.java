package com.example.person3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CodeExecutionRequest {

    @NotNull
    private Integer languageId;

    @NotBlank
    private String sourceCode;

    private String stdin;

    public Integer getLanguageId() {
        return languageId;
    }

    public String getSourceCode() {
        return sourceCode;
    }

    public String getStdin() {
        return stdin;
    }

    public void setLanguageId(Integer languageId) {
        this.languageId = languageId;
    }

    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    public void setStdin(String stdin) {
        this.stdin = stdin;
    }
}