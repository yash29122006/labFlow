package com.example.person3.controller;

import com.example.person3.dto.FacultyRequest;
import com.example.person3.dto.UserResponse;
import com.example.person3.entity.Faculty;
import com.example.person3.entity.Subject;
import com.example.person3.service.AdminFacultyService;
import com.example.person3.service.FacultySubjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/faculty")
public class AdminFacultyController {

    private final AdminFacultyService adminFacultyService;
    private final FacultySubjectService facultySubjectService;

    public AdminFacultyController(
            AdminFacultyService adminFacultyService,
            FacultySubjectService facultySubjectService) {
        this.adminFacultyService = adminFacultyService;
        this.facultySubjectService = facultySubjectService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createFaculty(@Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(toResponse(adminFacultyService.createFaculty(request)));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllFaculty() {
        return ResponseEntity.ok(adminFacultyService.getAllFaculty()
                .stream()
                .map(this::toResponse)
                .toList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        return adminFacultyService.deleteFaculty(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @PostMapping("/{facultyId}/subjects/{subjectId}")
    public ResponseEntity<Void> assignSubject(
            @PathVariable Long facultyId,
            @PathVariable Long subjectId) {

        facultySubjectService.assignSubject(facultyId, subjectId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{facultyId}/subjects/{subjectId}")
    public ResponseEntity<Void> removeSubject(
            @PathVariable Long facultyId,
            @PathVariable Long subjectId) {

        return facultySubjectService.removeSubject(facultyId, subjectId)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/{facultyId}/subjects")
    public ResponseEntity<List<Subject>> getFacultySubjects(
            @PathVariable Long facultyId) {

        return ResponseEntity.ok(
                facultySubjectService.getSubjectsForFaculty(facultyId)
        );
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateFacultyStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Boolean> body) {
        Boolean active = body.getOrDefault("active", true);
        return ResponseEntity.ok(toResponse(adminFacultyService.updateFacultyStatus(id, active)));
    }

    private UserResponse toResponse(Faculty faculty) {
        UserResponse response = new UserResponse();
        response.setId(faculty.getId());
        response.setUid(faculty.getFacultyId());
        response.setName(faculty.getName());
        response.setDepartment(faculty.getDepartment());
        response.setEmail(faculty.getEmail());
        response.setRole(faculty.getRole());
        response.setActive(faculty.getActive() != null ? faculty.getActive() : true);
        return response;
    }
}
