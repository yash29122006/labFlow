package com.example.person3.controller;

import com.example.person3.dto.SubjectRequest;
import com.example.person3.entity.Subject;
import com.example.person3.service.AcademicAccessService;
import com.example.person3.service.SubjectService;
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
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;
    private final AcademicAccessService academicAccessService;

    public SubjectController(
            SubjectService subjectService,
            AcademicAccessService academicAccessService) {
        this.subjectService = subjectService;
        this.academicAccessService = academicAccessService;
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.createSubject(request));
    }

    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Subject>> getMySubjects(
            Authentication authentication,
            @RequestAttribute("userId") Long userId) {

        if (hasRole(authentication, "FACULTY")) {
            return ResponseEntity.ok(
                    academicAccessService.getFacultySubjects(userId)
            );
        }

        return ResponseEntity.ok(
                academicAccessService.getStudentSubjects(userId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Subject> getSubjectById(
            @PathVariable Long id,
            Authentication authentication,
            @RequestAttribute(value = "userId", required = false) Long userId) {

        Subject subject = subjectService.getSubjectById(id)
                .orElse(null);

        if (subject == null) {
            return ResponseEntity.notFound().build();
        }

        if (hasRole(authentication, "ADMIN")) {
            return ResponseEntity.ok(subject);
        }

        if (hasRole(authentication, "FACULTY")) {
            academicAccessService.requireFacultySubjectAccess(userId, id);
        } else {
            academicAccessService.requireStudentSubjectAccess(userId, id);
        }

        return ResponseEntity.ok(subject);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody SubjectRequest request) {
        return subjectService.updateSubject(id, request)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        return subjectService.deleteSubject(id)
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
