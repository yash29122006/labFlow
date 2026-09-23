package com.example.person3.repository;

import com.example.person3.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Optional<Submission> findByStudentIdAndAssignmentId(
            Long studentId,
            Long assignmentId
    );

    List<Submission> findByStudentId(Long studentId);

    List<Submission> findByAssignmentId(Long assignmentId);

    long countByStudentId(Long studentId);

    @Query(value = """
            SELECT COUNT(*)
            FROM submissions s
            WHERE EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = s.assignment_id
            )
            AND NOT EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = s.assignment_id
                  AND NOT EXISTS (
                      SELECT 1
                      FROM faculty_subjects fs
                      WHERE fs.faculty_id = :facultyId
                        AND fs.subject_id = sa.subject_id
                  )
            )
            """, nativeQuery = true)
    long countForFaculty(@Param("facultyId") Long facultyId);
}
