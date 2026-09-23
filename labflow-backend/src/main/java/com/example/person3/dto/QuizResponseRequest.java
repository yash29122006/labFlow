package com.example.person3.dto;

import jakarta.validation.constraints.NotNull;

public class QuizResponseRequest {

    @NotNull
    private Long quizId;

    private String answer;

    public Long getQuizId() {
        return quizId;
    }

    public String getAnswer() {
        return answer;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}