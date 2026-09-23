package com.example.person3.entity;

import java.io.Serializable;
import java.util.Objects;

public class SubjectAssignmentId implements Serializable {

    private Long subjectId;
    private Long assignmentId;

    public SubjectAssignmentId() {
    }

    public SubjectAssignmentId(Long subjectId, Long assignmentId) {
        this.subjectId = subjectId;
        this.assignmentId = assignmentId;
    }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }
    public Long getAssignmentId() { return assignmentId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SubjectAssignmentId that)) return false;
        return Objects.equals(subjectId, that.subjectId)
                && Objects.equals(assignmentId, that.assignmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(subjectId, assignmentId);
    }
}
