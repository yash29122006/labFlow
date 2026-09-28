package com.example.person3.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AssignmentRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @Valid
    private AssignmentDetailsRequest details;

    @NotNull
    private Boolean isOpen;

    private List<Long> subjectIds;

    private Integer quizTimeLimitMinutes;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AssignmentDetailsRequest getDetails() {
        return details;
    }

    public void setDetails(AssignmentDetailsRequest details) {
        this.details = details;
    }

    public Boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }

    public List<Long> getSubjectIds() {
        return subjectIds;
    }

    public void setSubjectIds(List<Long> subjectIds) {
        this.subjectIds = subjectIds;
    }

    public Integer getQuizTimeLimitMinutes() {
        return quizTimeLimitMinutes;
    }

    public void setQuizTimeLimitMinutes(Integer quizTimeLimitMinutes) {
        this.quizTimeLimitMinutes = quizTimeLimitMinutes;
    }
}
