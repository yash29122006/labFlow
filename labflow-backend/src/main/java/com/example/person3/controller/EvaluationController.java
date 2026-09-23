package com.example.person3.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.person3.dto.EvaluationRequest;
import com.example.person3.dto.EvaluationResponse;
import com.example.person3.service.EvaluationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin
public class EvaluationController {

    private final EvaluationService evaluationService;
    public EvaluationController(
            EvaluationService evaluationService) {

        this.evaluationService = evaluationService;
    }

    @PostMapping
    public ResponseEntity<EvaluationResponse> evaluateSubmission(
            @Valid @RequestBody EvaluationRequest request,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                evaluationService.evaluateSubmission(request, facultyId)
        );
    }

    @GetMapping("/submission/{submissionId}")
    public ResponseEntity<EvaluationResponse> getEvaluationBySubmission(
            @PathVariable Long submissionId,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                evaluationService.getEvaluationBySubmission(
                        submissionId,
                        facultyId
                )
        );
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<EvaluationResponse>> getEvaluationsByAssignment(
            @PathVariable Long assignmentId,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                evaluationService.getEvaluationsByAssignment(
                        assignmentId,
                        facultyId
                )
        );
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Map<String, String>> publishEvaluation(
            @PathVariable Long id,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                evaluationService.publishEvaluation(id, facultyId)
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<EvaluationResponse>> getMyResults(
            @RequestAttribute("userId") Long studentId) {

        return ResponseEntity.ok(
                evaluationService.getMyResults(studentId)
        );
    }
}
