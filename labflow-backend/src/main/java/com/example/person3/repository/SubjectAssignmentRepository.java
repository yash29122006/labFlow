package com.example.person3.repository;

import com.example.person3.entity.SubjectAssignment;
import com.example.person3.entity.SubjectAssignmentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectAssignmentRepository extends JpaRepository<SubjectAssignment, SubjectAssignmentId> {

    List<SubjectAssignment> findBySubjectId(Long subjectId);

    List<SubjectAssignment> findByAssignmentId(Long assignmentId);

    void deleteByAssignmentId(Long assignmentId);
}
