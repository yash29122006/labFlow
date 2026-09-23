package com.example.person3.service;

import com.example.person3.entity.Student;
import com.example.person3.entity.Subject;
import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.FacultySubjectRepository;
import com.example.person3.repository.SubjectRepository;
import com.example.person3.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.List;

@Service
public class AcademicAccessService {

    private final FacultySubjectRepository facultySubjectRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;

    public AcademicAccessService(
            FacultySubjectRepository facultySubjectRepository,
            AssignmentRepository assignmentRepository,
            SubjectRepository subjectRepository,
            StudentRepository studentRepository) {
        this.facultySubjectRepository = facultySubjectRepository;
        this.assignmentRepository = assignmentRepository;
        this.subjectRepository = subjectRepository;
        this.studentRepository = studentRepository;
    }

    public void requireFacultySubjectAccess(Long facultyId, Long subjectId) {
        if (!facultySubjectRepository.existsByFacultyIdAndSubjectId(facultyId, subjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Faculty is not assigned to this subject"
            );
        }
    }

    /**
     * One DB count query instead of one query per subject.
     */
    public void requireFacultyAllSubjectsAccess(Long facultyId, Collection<Long> subjectIds) {
        if (subjectIds == null || subjectIds.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "At least one subject is required"
            );
        }

        long uniqueCount = subjectIds.stream().distinct().count();
        long assignedCount = facultySubjectRepository
                .countByFacultyIdAndSubjectIdIn(facultyId, subjectIds.stream().distinct().toList());

        if (assignedCount != uniqueCount) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Faculty is not assigned to all requested subjects"
            );
        }
    }

    /**
     * One SQL EXISTS/NOT EXISTS query. The assignment is accessible only
     * when the faculty has access to every subject linked to it.
     */
    public boolean facultyHasAssignmentAccess(Long facultyId, Long assignmentId) {
        return assignmentRepository.facultyHasAssignmentAccess(facultyId, assignmentId);
    }

    public void requireFacultyAssignmentAccess(Long facultyId, Long assignmentId) {
        if (!facultyHasAssignmentAccess(facultyId, assignmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Faculty is not assigned to all subjects of this assignment"
            );
        }
    }

    /** One SQL join instead of two separate queries. */
    public List<Subject> getFacultySubjects(Long facultyId) {
        return subjectRepository.findByFacultyId(facultyId);
    }

    public List<Subject> getStudentSubjects(Long studentId) {
        return subjectRepository.findByStudentId(studentId);
    }

    /** One DB query for the authorization check. */
    public void requireStudentSubjectAccess(Long studentId, Long subjectId) {
        if (!subjectRepository.existsForStudent(studentId, subjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student is not eligible for this subject"
            );
        }
    }

    /** One SQL EXISTS query instead of loading student + links + subjects. */
    public boolean studentHasAssignmentAccess(Long studentId, Long assignmentId) {
        return assignmentRepository.studentHasAssignmentAccess(studentId, assignmentId);
    }

    public void requireStudentAssignmentAccess(Long studentId, Long assignmentId) {
        if (!studentHasAssignmentAccess(studentId, assignmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student is not eligible for this assignment"
            );
        }
    }

    /** One set-based query instead of loading every student into Java. */
    public List<Student> getStudentsForFaculty(Long facultyId) {
        return studentRepository.findForFaculty(facultyId);
    }

}
