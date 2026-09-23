package com.example.person3.entity;

import java.io.Serializable;
import java.util.Objects;

public class FacultySubjectId implements Serializable {

    private Long facultyId;
    private Long subjectId;

    public FacultySubjectId() {
    }

    public FacultySubjectId(Long facultyId, Long subjectId) {
        this.facultyId = facultyId;
        this.subjectId = subjectId;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof FacultySubjectId that)) return false;
        return Objects.equals(facultyId, that.facultyId)
                && Objects.equals(subjectId, that.subjectId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(facultyId, subjectId);
    }
}
