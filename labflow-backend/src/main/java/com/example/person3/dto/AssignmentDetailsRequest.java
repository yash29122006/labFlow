package com.example.person3.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignmentDetailsRequest {

    @NotBlank
    private String aim;

    @NotBlank
    private String theory;

    @NotBlank
    private String learningOutcomes;

    @NotBlank
    private String courseOutcomes;

    @NotBlank
    private String conclusion;

    public String getAim() {
        return aim;
    }

    public void setAim(String aim) {
        this.aim = aim;
    }

    public String getTheory() {
        return theory;
    }

    public void setTheory(String theory) {
        this.theory = theory;
    }

    public String getLearningOutcomes() {
        return learningOutcomes;
    }

    public void setLearningOutcomes(String learningOutcomes) {
        this.learningOutcomes = learningOutcomes;
    }

    public String getCourseOutcomes() {
        return courseOutcomes;
    }

    public void setCourseOutcomes(String courseOutcomes) {
        this.courseOutcomes = courseOutcomes;
    }

    public String getConclusion() {
        return conclusion;
    }

    public void setConclusion(String conclusion) {
        this.conclusion = conclusion;
    }
}
