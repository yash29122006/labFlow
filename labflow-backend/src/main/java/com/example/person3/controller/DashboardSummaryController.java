package com.example.person3.controller;

import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.FacultyRepository;
import com.example.person3.repository.QuizRepository;
import com.example.person3.repository.StudentRepository;
import com.example.person3.repository.SubjectRepository;
import com.example.person3.repository.SubmissionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard/summary")
public class DashboardSummaryController {

    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;

    public DashboardSummaryController(
            SubjectRepository subjectRepository,
            FacultyRepository facultyRepository,
            StudentRepository studentRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            QuizRepository quizRepository) {
        this.subjectRepository = subjectRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Long>> getSummary(
            Authentication authentication,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        Map<String, Long> summary = new LinkedHashMap<>();

        boolean isAdmin = hasRole(authentication, "ADMIN");
        boolean isFaculty = hasRole(authentication, "FACULTY");

        if (isAdmin) {
            summary.put("subjects", subjectRepository.count());
            summary.put("faculty", facultyRepository.count());
            summary.put("students", studentRepository.count());
            summary.put("assignments", assignmentRepository.count());
        } else if (isFaculty) {
            summary.put("subjects", subjectRepository.countForFaculty(userId));
            summary.put("assignments", assignmentRepository.countForFaculty(userId));
            summary.put("quizzes", quizRepository.countDistinctAssignmentsForFaculty(userId));
            summary.put("submissions", submissionRepository.countForFaculty(userId));
        } else {
            summary.put("subjects", countStudentSubjects(userId));
            summary.put("assignments", assignmentRepository.countOpenForStudent(userId));
            summary.put("quizzes", quizRepository.countDistinctOpenAssignmentsForStudent(userId));
            summary.put("submissions", submissionRepository.countByStudentId(userId));
        }

        return ResponseEntity.ok(summary);
    }

    private long countStudentSubjects(Long studentId) {
        // The existing student-subject query already uses the indexed academic
        // fields, so keep it as one inexpensive query.
        return subjectRepository.findByStudentId(studentId).size();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }
}
