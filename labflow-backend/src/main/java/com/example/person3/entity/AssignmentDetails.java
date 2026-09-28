package com.example.person3.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "assignment_details")
public class AssignmentDetails {

    @Id
    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String aim;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String theory;

    @Column(name = "learning_outcomes", nullable = false, columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(name = "course_outcomes", nullable = false, columnDefinition = "TEXT")
    private String courseOutcomes;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conclusion;

    public AssignmentDetails() {
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
    }

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
