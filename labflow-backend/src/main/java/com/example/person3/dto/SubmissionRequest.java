package com.example.person3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubmissionRequest {

    @NotNull
    private Long assignmentId;

    @NotBlank
    private String code;

    private String language;

    public Long getAssignmentId() {
        return assignmentId;
    }

    public String getCode() {
        return code;
    }

    public String getLanguage() {
        return language;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setLanguage(String language) {
        this.language = language;
    }
}