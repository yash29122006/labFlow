package com.example.person3.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "subject_assignments")
@IdClass(SubjectAssignmentId.class)
public class SubjectAssignment {

    @Id
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Id
    @Column(name = "assignment_id", nullable = false)
    private Long assignmentId;

    public SubjectAssignment() {
    }

    public SubjectAssignment(Long subjectId, Long assignmentId) {
        this.subjectId = subjectId;
        this.assignmentId = assignmentId;
    }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
}
