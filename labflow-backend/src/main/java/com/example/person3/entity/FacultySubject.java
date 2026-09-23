package com.example.person3.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

@Entity
@Table(name = "faculty_subjects")
@IdClass(FacultySubjectId.class)
public class FacultySubject {

    @Id
    @Column(name = "faculty_id", nullable = false)
    private Long facultyId;

    @Id
    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    public FacultySubject() {
    }

    public FacultySubject(Long facultyId, Long subjectId) {
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
}
