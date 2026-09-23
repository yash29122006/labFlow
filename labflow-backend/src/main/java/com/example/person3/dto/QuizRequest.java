package com.example.person3.dto;

import com.example.person3.entity.QuizType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class QuizRequest {

    @NotNull
    private Long assignmentId;

    @NotBlank
    private String question;

    @NotNull
    private QuizType type;

    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctAnswer;

    @NotNull
    @Min(1)
    private Integer marks;

    public Long getAssignmentId() {
        return assignmentId;
    }

    public String getQuestion() {
        return question;
    }

    public QuizType getType() {
        return type;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public Integer getMarks() {
        return marks;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public void setType(QuizType type) {
        this.type = type;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }
}