package com.example.person3.controller;

import com.example.person3.dto.StudentRegisterRequest;
import com.example.person3.dto.UserResponse;
import com.example.person3.entity.Student;
import com.example.person3.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
public class AdminStudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStudentController(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll().stream()
                .map(this::toResponse)
                .toList());
    }

    @PostMapping
    public ResponseEntity<UserResponse> createStudent(@Valid @RequestBody StudentRegisterRequest request) {
        if (studentRepository.existsByUid(request.getUid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "UID already registered");
        }
        if (studentRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Student student = new Student();
        student.setUid(request.getUid());
        student.setName(request.getName());
        student.setDepartment(request.getDepartment());
        student.setAcademicYear(request.getAcademicYear());
        student.setSemester(request.getSemester());
        student.setRollNumber(request.getRollNumber());
        student.setBatch(request.getBatch());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole("STUDENT");
        student.setActive(true);

        return ResponseEntity.ok(toResponse(studentRepository.save(student)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRegisterRequest request) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        if (!student.getUid().equals(request.getUid()) && studentRepository.existsByUid(request.getUid())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "UID already registered");
        }
        if (!student.getEmail().equals(request.getEmail()) && studentRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        student.setUid(request.getUid());
        student.setName(request.getName());
        student.setDepartment(request.getDepartment());
        student.setAcademicYear(request.getAcademicYear());
        student.setSemester(request.getSemester());
        student.setRollNumber(request.getRollNumber());
        student.setBatch(request.getBatch());
        student.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            student.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return ResponseEntity.ok(toResponse(studentRepository.save(student)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateStudentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        Boolean active = body.getOrDefault("active", true);
        student.setActive(active);
        return ResponseEntity.ok(toResponse(studentRepository.save(student)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toResponse(Student student) {
        UserResponse res = new UserResponse();
        res.setId(student.getId());
        res.setUid(student.getUid());
        res.setName(student.getName());
        res.setDepartment(student.getDepartment());
        res.setAcademicYear(student.getAcademicYear());
        res.setSemester(student.getSemester());
        res.setRollNumber(student.getRollNumber());
        res.setBatch(student.getBatch());
        res.setEmail(student.getEmail());
        res.setRole(student.getRole());
        res.setActive(student.getActive() != null ? student.getActive() : true);
        return res;
    }
}
