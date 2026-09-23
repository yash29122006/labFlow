package com.example.person3.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class EvaluationRequest {

    @NotNull
    private Long submissionId;

    @NotNull
    @Min(0)
    @Max(50)
    private Integer correctness;

    @NotNull
    @Min(0)
    @Max(30)
    private Integer quality;

    @NotNull
    @Min(0)
    @Max(20)
    private Integer explanation;

    private String feedback;


    public Long getSubmissionId() {
        return submissionId;
    }

    public void setSubmissionId(Long submissionId) {
        this.submissionId = submissionId;
    }


    public Integer getCorrectness() {
        return correctness;
    }

    public void setCorrectness(Integer correctness) {
        this.correctness = correctness;
    }


    public Integer getQuality() {
        return quality;
    }

    public void setQuality(Integer quality) {
        this.quality = quality;
    }


    public Integer getExplanation() {
        return explanation;
    }

    public void setExplanation(Integer explanation) {
        this.explanation = explanation;
    }


    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}