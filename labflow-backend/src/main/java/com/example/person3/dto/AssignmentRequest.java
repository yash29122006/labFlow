package com.example.person3.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class AssignmentRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String instructions;

    @NotNull
    private Boolean isOpen;

    private List<Long> subjectIds;

    private java.time.LocalDate dueDate;

    private Integer quizTimeLimitMinutes;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInstructions() { return instructions; }
    public void setInstructions(String instructions) { this.instructions = instructions; }
    public Boolean getIsOpen() { return isOpen; }
    public void setIsOpen(Boolean isOpen) { this.isOpen = isOpen; }
    public List<Long> getSubjectIds() { return subjectIds; }
    public void setSubjectIds(List<Long> subjectIds) { this.subjectIds = subjectIds; }
    public java.time.LocalDate getDueDate() { return dueDate; }
    public void setDueDate(java.time.LocalDate dueDate) { this.dueDate = dueDate; }
    public Integer getQuizTimeLimitMinutes() { return quizTimeLimitMinutes; }
    public void setQuizTimeLimitMinutes(Integer quizTimeLimitMinutes) { this.quizTimeLimitMinutes = quizTimeLimitMinutes; }
}
