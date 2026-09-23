package com.example.person3.repository;

import com.example.person3.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    @Query(value = """
            SELECT a.*
            FROM assignments a
            WHERE EXISTS (
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
            ORDER BY a.id
            """, nativeQuery = true)
    List<Assignment> findAllForFaculty(@Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT DISTINCT a.*
            FROM assignments a
            JOIN subject_assignments sa ON sa.assignment_id = a.id
            JOIN subjects s ON s.id = sa.subject_id
            JOIN students st ON st.id = :studentId
            WHERE a.is_open = TRUE
              AND LOWER(s.department) = LOWER(st.department)
              AND s.academic_year = st.academic_year
              AND s.semester = st.semester
            ORDER BY a.id
            """, nativeQuery = true)
    List<Assignment> findAllOpenForStudent(@Param("studentId") Long studentId);

    @Query(value = """
            SELECT DISTINCT a.*
            FROM assignments a
            JOIN subject_assignments sa ON sa.assignment_id = a.id
            WHERE sa.subject_id = :subjectId
            ORDER BY a.id
            """, nativeQuery = true)
    List<Assignment> findAllBySubjectId(@Param("subjectId") Long subjectId);

    @Query(value = """
            SELECT DISTINCT a.*
            FROM assignments a
            JOIN subject_assignments requested_sa
              ON requested_sa.assignment_id = a.id
             AND requested_sa.subject_id = :subjectId
            WHERE NOT EXISTS (
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
            ORDER BY a.id
            """, nativeQuery = true)
    List<Assignment> findAllBySubjectIdForFaculty(
            @Param("subjectId") Long subjectId,
            @Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT DISTINCT a.*
            FROM assignments a
            JOIN subject_assignments sa ON sa.assignment_id = a.id
            WHERE sa.subject_id = :subjectId
              AND a.is_open = TRUE
            ORDER BY a.id
            """, nativeQuery = true)
    List<Assignment> findAllOpenBySubjectId(@Param("subjectId") Long subjectId);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = :assignmentId
            )
            AND NOT EXISTS (
                SELECT 1
                FROM subject_assignments sa
                WHERE sa.assignment_id = :assignmentId
                  AND NOT EXISTS (
                      SELECT 1
                      FROM faculty_subjects fs
                      WHERE fs.faculty_id = :facultyId
                        AND fs.subject_id = sa.subject_id
                  )
            )
            """, nativeQuery = true)
    boolean facultyHasAssignmentAccess(
            @Param("facultyId") Long facultyId,
            @Param("assignmentId") Long assignmentId);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM assignments a
                JOIN subject_assignments sa ON sa.assignment_id = a.id
                JOIN subjects s ON s.id = sa.subject_id
                JOIN students st ON st.id = :studentId
                WHERE a.id = :assignmentId
                  AND LOWER(s.department) = LOWER(st.department)
                  AND s.academic_year = st.academic_year
                  AND s.semester = st.semester
            )
            """, nativeQuery = true)
    boolean studentHasAssignmentAccess(
            @Param("studentId") Long studentId,
            @Param("assignmentId") Long assignmentId);

    @Query(value = """
            SELECT COUNT(*)
            FROM assignments a
            WHERE EXISTS (
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
            """, nativeQuery = true)
    long countForFaculty(@Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT COUNT(DISTINCT a.id)
            FROM assignments a
            JOIN subject_assignments sa ON sa.assignment_id = a.id
            JOIN subjects s ON s.id = sa.subject_id
            JOIN students st ON st.id = :studentId
            WHERE a.is_open = TRUE
              AND LOWER(s.department) = LOWER(st.department)
              AND s.academic_year = st.academic_year
              AND s.semester = st.semester
            """, nativeQuery = true)
    long countOpenForStudent(@Param("studentId") Long studentId);

    @Query(value = """
            SELECT COUNT(*)
            FROM subject_assignments sa
            WHERE sa.subject_id = :subjectId
            """, nativeQuery = true)
    long countLinksBySubjectId(@Param("subjectId") Long subjectId);
}
