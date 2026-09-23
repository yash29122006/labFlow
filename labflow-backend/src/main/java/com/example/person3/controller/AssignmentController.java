package com.example.person3.controller;

import com.example.person3.dto.AssignmentRequest;
import com.example.person3.entity.Assignment;
import com.example.person3.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(
            @Valid @RequestBody AssignmentRequest request,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                assignmentService.createAssignment(request, facultyId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Assignment>> getAllAssignments(
            Authentication authentication,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (hasRole(authentication, "ADMIN")) {
            return ResponseEntity.ok(assignmentService.getAllAssignments());
        }

        if (hasRole(authentication, "FACULTY")) {
            return ResponseEntity.ok(
                    assignmentService.getAllAssignmentsForFaculty(userId)
            );
        }

        return ResponseEntity.ok(
                assignmentService.getAllAssignmentsForStudent(userId)
        );
    }

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Assignment>> getAssignmentsBySubject(
            @PathVariable Long subjectId,
            Authentication authentication,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (hasRole(authentication, "ADMIN")) {
            return ResponseEntity.ok(
                    assignmentService.getAssignmentsBySubject(subjectId)
            );
        }

        if (hasRole(authentication, "FACULTY")) {
            return ResponseEntity.ok(
                    assignmentService.getAssignmentsBySubjectForFaculty(
                            subjectId,
                            userId
                    )
            );
        }

        return ResponseEntity.ok(
                assignmentService.getAssignmentsBySubjectForStudent(
                        subjectId,
                        userId
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assignment> getAssignmentById(
            @PathVariable Long id,
            Authentication authentication,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        if (hasRole(authentication, "ADMIN")) {
            return assignmentService.getAssignmentById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        if (hasRole(authentication, "FACULTY")) {
            return ResponseEntity.ok(
                    assignmentService.getAssignmentByIdForFaculty(id, userId)
            );
        }

        return ResponseEntity.ok(
                assignmentService.getAssignmentByIdForStudent(id, userId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Assignment> updateAssignment(
            @PathVariable Long id,
            @Valid @RequestBody AssignmentRequest request,
            @RequestAttribute("userId") Long facultyId) {

        return assignmentService.updateAssignment(id, request, facultyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<Assignment> openAssignment(
            @PathVariable Long id,
            @RequestAttribute("userId") Long facultyId) {

        return assignmentService.openAssignment(id, facultyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Assignment> closeAssignment(
            @PathVariable Long id,
            @RequestAttribute("userId") Long facultyId) {

        return assignmentService.closeAssignment(id, facultyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id,
            @RequestAttribute("userId") Long facultyId) {

        return assignmentService.deleteAssignment(id, facultyId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_" + role)
                );
    }
}
