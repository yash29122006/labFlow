package com.example.person3.repository;

import com.example.person3.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByDepartmentAndAcademicYearAndSemester(
            String department,
            Integer academicYear,
            Integer semester
    );

    @Query(value = """
            SELECT s.*
            FROM subjects s
            JOIN faculty_subjects fs ON fs.subject_id = s.id
            WHERE fs.faculty_id = :facultyId
            ORDER BY s.id
            """, nativeQuery = true)
    List<Subject> findByFacultyId(@Param("facultyId") Long facultyId);

    @Query(value = """
            SELECT EXISTS (
                SELECT 1
                FROM subjects s
                JOIN students st ON st.id = :studentId
                WHERE s.id = :subjectId
                  AND LOWER(s.department) = LOWER(st.department)
                  AND s.academic_year = st.academic_year
                  AND s.semester = st.semester
            )
            """, nativeQuery = true)
    boolean existsForStudent(
            @Param("studentId") Long studentId,
            @Param("subjectId") Long subjectId);

    long countByIdIn(Collection<Long> ids);

    @Query(value = """
            SELECT s.*
            FROM subjects s
            JOIN students st ON LOWER(s.department) = LOWER(st.department)
                AND s.academic_year = st.academic_year
                AND s.semester = st.semester
            WHERE st.id = :studentId
            ORDER BY s.id
            """, nativeQuery = true)
    List<Subject> findByStudentId(@Param("studentId") Long studentId);

    @Query(value = """
            SELECT COUNT(*)
            FROM subjects s
            JOIN faculty_subjects fs ON fs.subject_id = s.id
            WHERE fs.faculty_id = :facultyId
            """, nativeQuery = true)
    long countForFaculty(@Param("facultyId") Long facultyId);
}
