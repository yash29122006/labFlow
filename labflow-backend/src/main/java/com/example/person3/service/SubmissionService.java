package com.example.person3.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.person3.dto.SubmissionRequest;
import com.example.person3.dto.SubmissionResponse;
import com.example.person3.entity.Assignment;
import com.example.person3.entity.Evaluation;
import com.example.person3.entity.Student;
import com.example.person3.entity.Submission;
import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.EvaluationRepository;
import com.example.person3.repository.StudentRepository;
import com.example.person3.repository.SubmissionRepository;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final EvaluationRepository evaluationRepository;
    private final AcademicAccessService academicAccessService;

    public SubmissionService(
            SubmissionRepository submissionRepository,
            AssignmentRepository assignmentRepository,
            StudentRepository studentRepository,
            EvaluationRepository evaluationRepository,
            AcademicAccessService academicAccessService) {

        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.evaluationRepository = evaluationRepository;
        this.academicAccessService = academicAccessService;
    }

    public SubmissionResponse createSubmission(
            SubmissionRequest request,
            Long studentId) {

        Long assignmentId = request.getAssignmentId();

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assignment not found"));

        academicAccessService.requireStudentAssignmentAccess(
                studentId,
                assignmentId
        );

        if (!Boolean.TRUE.equals(assignment.getIsOpen())) {
            throw new IllegalStateException(
                    "This assignment is closed"
            );
        }

        if (submissionRepository
                .findByStudentIdAndAssignmentId(
                        studentId,
                        assignmentId
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "You have already submitted this assignment"
            );
        }

        Submission submission = new Submission();

        submission.setStudentId(studentId);
        submission.setAssignmentId(assignmentId);
        submission.setCode(request.getCode());
        submission.setLanguage(request.getLanguage() != null ? request.getLanguage() : "java");

        Submission saved = submissionRepository.save(submission);
        return toResponse(saved, assignment, studentRepository.findById(studentId).orElse(null), null);
    }

    public List<SubmissionResponse> getMySubmissions(Long studentId) {
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        return enrichSubmissions(submissions);
    }

    public SubmissionResponse getSubmissionForFaculty(Long id, Long facultyId) {
        Submission submission = getSubmission(id);

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                submission.getAssignmentId()
        );

        return enrichSingle(submission);
    }

    public SubmissionResponse getSubmissionForStudent(Long id, Long studentId) {
        Submission submission = getSubmission(id);

        if (!submission.getStudentId().equals(studentId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only access your own submission"
            );
        }

        return enrichSingle(submission);
    }

    public List<SubmissionResponse> getSubmissionsByAssignment(
            Long assignmentId,
            Long facultyId) {

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                assignmentId
        );

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return enrichSubmissions(submissions);
    }

    private Submission getSubmission(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Submission not found"));
    }

    private SubmissionResponse enrichSingle(Submission submission) {
        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
        Student student = studentRepository.findById(submission.getStudentId()).orElse(null);
        Evaluation evaluation = evaluationRepository.findBySubmissionId(submission.getId()).orElse(null);
        return toResponse(submission, assignment, student, evaluation);
    }

    private List<SubmissionResponse> enrichSubmissions(List<Submission> submissions) {
        if (submissions.isEmpty()) {
            return List.of();
        }

        List<Long> submissionIds = submissions.stream().map(Submission::getId).toList();
        List<Long> assignmentIds = submissions.stream().map(Submission::getAssignmentId).distinct().toList();
        List<Long> studentIds = submissions.stream().map(Submission::getStudentId).distinct().toList();

        Map<Long, Assignment> assignmentMap = assignmentRepository.findAllById(assignmentIds).stream()
                .collect(Collectors.toMap(Assignment::getId, a -> a));
        Map<Long, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(Student::getId, s -> s));
        Map<Long, Evaluation> evalMap = evaluationRepository.findBySubmissionIdIn(submissionIds).stream()
                .collect(Collectors.toMap(Evaluation::getSubmissionId, e -> e));

        List<SubmissionResponse> result = new ArrayList<>();
        for (Submission sub : submissions) {
            Assignment a = assignmentMap.get(sub.getAssignmentId());
            Student s = studentMap.get(sub.getStudentId());
            Evaluation e = evalMap.get(sub.getId());
            result.add(toResponse(sub, a, s, e));
        }
        return result;
    }

    private SubmissionResponse toResponse(Submission submission, Assignment assignment, Student student, Evaluation evaluation) {
        SubmissionResponse res = new SubmissionResponse();
        res.setId(submission.getId());
        res.setStudentId(submission.getStudentId());
        res.setAssignmentId(submission.getAssignmentId());
        res.setCode(submission.getCode());
        res.setSubmittedAt(submission.getSubmittedAt());
        res.setLanguage(submission.getLanguage());

        if (assignment != null) {
            res.setAssignmentTitle(assignment.getTitle());
        }

        if (student != null) {
            res.setStudentName(student.getName());
            res.setStudentUid(student.getUid());
        }

        if (evaluation != null) {
            res.setEvaluationStatus(Boolean.TRUE.equals(evaluation.getPublished()) ? "PUBLISHED" : "EVALUATED");
        } else {
            res.setEvaluationStatus("PENDING");
        }

        return res;
    }
}

