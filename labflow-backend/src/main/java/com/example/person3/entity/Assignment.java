package com.example.person3.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_open", nullable = false)
    private Boolean isOpen;

    @Column(name = "quiz_time_limit_minutes")
    private Integer quizTimeLimitMinutes;

    /**
     * Details are loaded explicitly by AssignmentService for single-assignment
     * responses. Keeping this field transient prevents N+1 queries on list pages.
     */
    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private AssignmentDetails details;

    public Assignment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public Boolean getIsOpen() {
        return isOpen;
    }

    public void setIsOpen(Boolean isOpen) {
        this.isOpen = isOpen;
    }

    public Integer getQuizTimeLimitMinutes() {
        return quizTimeLimitMinutes;
    }

    public void setQuizTimeLimitMinutes(Integer quizTimeLimitMinutes) {
        this.quizTimeLimitMinutes = quizTimeLimitMinutes;
    }

    public AssignmentDetails getDetails() {
        return details;
    }

    public void setDetails(AssignmentDetails details) {
        this.details = details;
    }
}
