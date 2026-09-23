package com.example.person3.repository;

import com.example.person3.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByAssignmentId(Long assignmentId);

    long countByAssignmentId(Long assignmentId);

    @Query(value = """
            SELECT COUNT(DISTINCT q.assignment_id)
            FROM quizzes q
            WHERE EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = q.assignment_id
            )
            AND NOT EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = q.assignment_id
                  AND NOT EXISTS (
                      SELECT 1
                      FROM faculty_subjects fs
                      WHERE fs.faculty_id = :facultyId
                        AND fs.subject_id = sa.subject_id
                  )
            )
            """, nativeQuery = true)
    long countDistinctAssignmentsForFaculty(@Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT COUNT(DISTINCT q.assignment_id)
            FROM quizzes q
            JOIN assignments a ON a.id = q.assignment_id
            JOIN subject_assignments sa ON sa.assignment_id = a.id
            JOIN subjects s ON s.id = sa.subject_id
            JOIN students st ON st.id = :studentId
            WHERE a.is_open = TRUE
              AND LOWER(s.department) = LOWER(st.department)
              AND s.academic_year = st.academic_year
              AND s.semester = st.semester
            """, nativeQuery = true)
    long countDistinctOpenAssignmentsForStudent(@Param("studentId") Long studentId);

    @Query("select q from Quiz q where q.assignmentId in :assignmentIds order by q.assignmentId, q.id")
    List<Quiz> findByAssignmentIdIn(@Param("assignmentIds") Collection<Long> assignmentIds);

    @Query(value = """
            SELECT q.*
            FROM quizzes q
            JOIN assignments a ON a.id = q.assignment_id
            WHERE q.assignment_id = :assignmentId
              AND EXISTS (
                  SELECT 1
                  FROM subject_assignments sa
                  WHERE sa.assignment_id = a.id
              )
              AND NOT EXISTS (
                  SELECT 1
                  FROM subject_assignments sa
                  WHERE sa.assignment_id = a.id
                    AND NOT EXISTS (
                        SELECT 1
                        FROM faculty_subjects fs
                        WHERE fs.faculty_id = :facultyId
                          AND fs.subject_id = sa.subject_id
                    )
              )
            ORDER BY q.id
            """, nativeQuery = true)
    List<Quiz> findAccessibleByAssignmentForFaculty(
            @Param("assignmentId") Long assignmentId,
            @Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT q.*
            FROM quizzes q
            JOIN assignments a ON a.id = q.assignment_id
            WHERE q.assignment_id = :assignmentId
              AND a.is_open = TRUE
              AND EXISTS (
                  SELECT 1
                  FROM subject_assignments sa
                  JOIN subjects s ON s.id = sa.subject_id
                  JOIN students st ON st.id = :studentId
                  WHERE sa.assignment_id = a.id
                    AND LOWER(s.department) = LOWER(st.department)
                    AND s.academic_year = st.academic_year
                    AND s.semester = st.semester
              )
            ORDER BY q.id
            """, nativeQuery = true)
    List<Quiz> findAccessibleByAssignmentForStudent(
            @Param("assignmentId") Long assignmentId,
            @Param("studentId") Long studentId);
}
