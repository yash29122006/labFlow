package com.example.person3.repository;

import com.example.person3.entity.FacultySubject;
import com.example.person3.entity.FacultySubjectId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface FacultySubjectRepository extends JpaRepository<FacultySubject, FacultySubjectId> {

    List<FacultySubject> findByFacultyId(Long facultyId);

    List<FacultySubject> findBySubjectId(Long subjectId);

    boolean existsByFacultyIdAndSubjectId(Long facultyId, Long subjectId);

    long countByFacultyIdAndSubjectIdIn(Long facultyId, Collection<Long> subjectIds);

    void deleteByFacultyIdAndSubjectId(Long facultyId, Long subjectId);
}
