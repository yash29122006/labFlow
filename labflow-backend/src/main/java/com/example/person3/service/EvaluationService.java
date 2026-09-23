package com.example.person3.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.person3.dto.EvaluationRequest;
import com.example.person3.dto.EvaluationResponse;
import com.example.person3.entity.Evaluation;
import com.example.person3.entity.Submission;
import com.example.person3.repository.EvaluationRepository;
import com.example.person3.repository.SubmissionRepository;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final SubmissionRepository submissionRepository;
    private final AcademicAccessService academicAccessService;

    public EvaluationService(
            EvaluationRepository evaluationRepository,
            SubmissionRepository submissionRepository,
            AcademicAccessService academicAccessService) {

        this.evaluationRepository = evaluationRepository;
        this.submissionRepository = submissionRepository;
        this.academicAccessService = academicAccessService;
    }

    public EvaluationResponse evaluateSubmission(
            EvaluationRequest request,
            Long facultyId) {

        Submission submission = submissionRepository
                .findById(request.getSubmissionId())
                .orElseThrow(() ->
                        new RuntimeException("Submission not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                submission.getAssignmentId()
        );

        Evaluation evaluation = evaluationRepository
                .findBySubmissionId(submission.getId())
                .orElseGet(Evaluation::new);

        evaluation.setSubmissionId(submission.getId());
        evaluation.setCorrectness(request.getCorrectness());
        evaluation.setQuality(request.getQuality());
        evaluation.setExplanation(request.getExplanation());
        evaluation.setTotalMarks(
                request.getCorrectness()
                        + request.getQuality()
                        + request.getExplanation()
        );
        evaluation.setFeedback(request.getFeedback());

        evaluation.setPublished(false);

        Evaluation saved = evaluationRepository.save(evaluation);

        return toResponse(
                saved,
                submission.getAssignmentId()
        );
    }

    public EvaluationResponse getEvaluationBySubmission(
            Long submissionId,
            Long facultyId) {

        Evaluation evaluation =
                evaluationRepository
                        .findBySubmissionId(submissionId)
                        .orElseThrow(() ->
                                new RuntimeException("Evaluation not found"));

        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(() ->
                                new RuntimeException("Submission not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                submission.getAssignmentId()
        );

        return toResponse(
                evaluation,
                submission.getAssignmentId()
        );
    }

    public List<EvaluationResponse> getEvaluationsByAssignment(
            Long assignmentId,
            Long facultyId) {

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                assignmentId
        );

        List<Long> submissionIds =
                submissionRepository
                        .findByAssignmentId(assignmentId)
                        .stream()
                        .map(Submission::getId)
                        .collect(Collectors.toList());

        if (submissionIds.isEmpty()) {
            return List.of();
        }

        return evaluationRepository
                .findBySubmissionIdIn(submissionIds)
                .stream()
                .map(evaluation ->
                        toResponse(
                                evaluation,
                                assignmentId
                        ))
                .collect(Collectors.toList());
    }

    public Map<String, String> publishEvaluation(
            Long id,
            Long facultyId) {

        Evaluation evaluation =
                evaluationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Evaluation not found"));

        Submission submission =
                submissionRepository
                        .findById(evaluation.getSubmissionId())
                        .orElseThrow(() ->
                                new RuntimeException("Submission not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                submission.getAssignmentId()
        );

        evaluation.setPublished(true);
        evaluationRepository.save(evaluation);

        return Map.of(
                "message",
                "Result published"
        );
    }

    public List<EvaluationResponse> getMyResults(
            Long studentId) {

        List<Submission> mySubmissions =
                submissionRepository.findByStudentId(studentId);

        Map<Long, Long> submissionIdToAssignmentId =
                mySubmissions.stream()
                        .collect(Collectors.toMap(
                                Submission::getId,
                                Submission::getAssignmentId
                        ));

        if (submissionIdToAssignmentId.isEmpty()) {
            return List.of();
        }

        List<Long> submissionIds =
                List.copyOf(submissionIdToAssignmentId.keySet());

        return evaluationRepository
                .findBySubmissionIdInAndPublishedTrue(submissionIds)
                .stream()
                .map(evaluation ->
                        toResponse(
                                evaluation,
                                submissionIdToAssignmentId.get(
                                        evaluation.getSubmissionId()
                                )))
                .collect(Collectors.toList());
    }

    private EvaluationResponse toResponse(
            Evaluation evaluation,
            Long assignmentId) {

        EvaluationResponse response = new EvaluationResponse();

        response.setId(evaluation.getId());
        response.setSubmissionId(evaluation.getSubmissionId());
        response.setAssignmentId(assignmentId);
        response.setCorrectness(evaluation.getCorrectness());
        response.setQuality(evaluation.getQuality());
        response.setExplanation(evaluation.getExplanation());
        response.setTotalMarks(evaluation.getTotalMarks());
        response.setFeedback(evaluation.getFeedback());
        response.setPublished(evaluation.getPublished());

        return response;
    }
}
