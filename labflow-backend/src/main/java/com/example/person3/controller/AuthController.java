package com.example.person3.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.person3.dto.LoginRequest;
import com.example.person3.dto.LoginResponse;
import com.example.person3.dto.StudentRegisterRequest;
import com.example.person3.dto.UserResponse;
import com.example.person3.entity.Faculty;
import com.example.person3.entity.Student;
import com.example.person3.service.AuthService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {

    private final AuthService authService;


    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }


    // ========================================================
    // STUDENT REGISTRATION
    // ========================================================

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(
            @Valid @RequestBody StudentRegisterRequest request
    ) {

        String message =
                authService.registerStudent(request);


        return ResponseEntity.ok(
                Map.of(
                        "message",
                        message
                )
        );
    }


    // ========================================================
    // LOGIN
    // ========================================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        LoginResponse response =
                authService.login(request);


        return ResponseEntity.ok(response);
    }


    // ========================================================
    // CURRENT USER
    // ========================================================

    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Authentication required");
        }

        String identifier = authentication.getName();

        String role = authentication.getAuthorities()
                .stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElseThrow(() -> new RuntimeException("Role not found"));


        // ====================================================
        // STUDENT
        // ====================================================

        if (role.equals("STUDENT")) {

            Student student =
                    authService.getStudentByUid(
                            identifier
                    );


            UserResponse response =
                    new UserResponse();

            response.setId(student.getId());
            response.setUid(student.getUid());
            response.setName(student.getName());
            response.setDepartment(
                    student.getDepartment()
            );
            response.setAcademicYear(
                    student.getAcademicYear()
            );
            response.setSemester(
                    student.getSemester()
            );
            response.setRollNumber(
                    student.getRollNumber()
            );
            response.setBatch(
                    student.getBatch()
            );
            response.setEmail(
                    student.getEmail()
            );
            response.setRole(
                    student.getRole()
            );


            return ResponseEntity.ok(response);
        }


        // ====================================================
        // FACULTY
        // ====================================================

        if (role.equals("FACULTY")) {

            Faculty faculty =
                    authService.getFacultyById(
                            identifier
                    );


            UserResponse response =
                    new UserResponse();

            response.setId(faculty.getId());
            response.setUid(
                    faculty.getFacultyId()
            );
            response.setName(
                    faculty.getName()
            );
            response.setDepartment(
                    faculty.getDepartment()
            );
            response.setEmail(
                    faculty.getEmail()
            );
            response.setRole(
                    faculty.getRole()
            );


            return ResponseEntity.ok(response);
        }


        // ====================================================
        // ADMIN
        // ====================================================

        if (role.equals("ADMIN")) {

            UserResponse response =
                    new UserResponse();

            response.setId(0L);
            response.setUid(identifier);
            response.setName("LabFlow Admin");
            response.setRole("ADMIN");


            return ResponseEntity.ok(response);
        }


        throw new RuntimeException(
                "Invalid user role"
        );
    }
}