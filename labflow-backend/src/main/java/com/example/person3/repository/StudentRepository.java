package com.example.person3.repository;

import com.example.person3.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByUid(String uid);

    Optional<Student> findByEmail(String email);

    Optional<Student> findByUidOrEmail(String uid, String email);

    boolean existsByUid(String uid);

    boolean existsByEmail(String email);

    @Query(value = """
            SELECT DISTINCT st.*
            FROM students st
            JOIN subjects s
              ON LOWER(s.department) = LOWER(st.department)
             AND s.academic_year = st.academic_year
             AND s.semester = st.semester
            JOIN faculty_subjects fs ON fs.subject_id = s.id
            WHERE fs.faculty_id = :facultyId
            ORDER BY st.id
            """, nativeQuery = true)
    List<Student> findForFaculty(@Param("facultyId") Long facultyId);
}
