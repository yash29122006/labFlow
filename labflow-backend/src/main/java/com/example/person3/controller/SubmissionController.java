package com.example.person3.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.person3.dto.SubmissionRequest;
import com.example.person3.dto.SubmissionResponse;
import com.example.person3.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
@CrossOrigin
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> createSubmission(
            @RequestBody SubmissionRequest request,
            @RequestAttribute("userId") Long studentId) {

        return ResponseEntity.ok(
                submissionService.createSubmission(
                        request,
                        studentId
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @RequestAttribute("userId") Long studentId) {

        return ResponseEntity.ok(
                submissionService.getMySubmissions(studentId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getSubmission(
            @PathVariable Long id,
            Authentication authentication,
            @RequestAttribute("userId") Long userId) {

        if (hasRole(authentication, "FACULTY")) {
            return ResponseEntity.ok(
                    submissionService.getSubmissionForFaculty(id, userId)
            );
        }

        return ResponseEntity.ok(
                submissionService.getSubmissionForStudent(id, userId)
        );
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(
            @PathVariable Long assignmentId,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                submissionService.getSubmissionsByAssignment(
                        assignmentId,
                        facultyId
                )
        );
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_" + role)
                );
    }
}
