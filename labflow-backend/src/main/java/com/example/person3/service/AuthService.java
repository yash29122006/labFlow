package com.example.person3.service;

import com.example.person3.config.JwtService;
import com.example.person3.dto.LoginRequest;
import com.example.person3.dto.LoginResponse;
import com.example.person3.dto.StudentRegisterRequest;
import com.example.person3.dto.UserResponse;
import com.example.person3.entity.Faculty;
import com.example.person3.entity.Student;
import com.example.person3.repository.FacultyRepository;
import com.example.person3.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    @Value("${admin.id}")
    private String adminId;

    @Value("${admin.password}")
    private String adminPassword;

    @Value("${admin.name}")
    private String adminName;


    public AuthService(
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {

        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // ========================================================
    // STUDENT REGISTRATION
    // ========================================================

    public String registerStudent(
            StudentRegisterRequest request
    ) {

        if (studentRepository.existsByUid(
                request.getUid()
        )) {

            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "UID already registered"
            );
        }


        if (studentRepository.existsByEmail(
                request.getEmail()
        )) {

            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Email already registered"
            );
        }


        Student student = new Student();

        student.setUid(request.getUid());
        student.setName(request.getName());
        student.setDepartment(request.getDepartment());
        student.setAcademicYear(
                request.getAcademicYear()
        );
        student.setSemester(
                request.getSemester()
        );
        student.setRollNumber(
                request.getRollNumber()
        );
        student.setBatch(request.getBatch());
        student.setEmail(request.getEmail());


        // Password is stored as BCrypt hash
        student.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );


        student.setRole("STUDENT");
        student.setActive(true);


        studentRepository.save(student);


        return "Student registered successfully";
    }


    // ========================================================
    // LOGIN
    // ========================================================

    public LoginResponse login(
            LoginRequest request
    ) {

        String identifier =
                request.getIdentifier().trim();

        String password =
                request.getPassword();


        // ====================================================
        // ADMIN LOGIN
        // ====================================================

        if (identifier.equals(adminId)) {

            if (!password.equals(adminPassword)) {

                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED,
                        "Invalid credentials"
                );
            }


            String token =
                    jwtService.generateToken(
                            adminId,
                            "ADMIN"
                    );


            UserResponse user =
                    new UserResponse();

            user.setId(0L);
            user.setUid(adminId);
            user.setName(adminName);
            user.setRole("ADMIN");
            user.setActive(true);


            return new LoginResponse(
                    token,
                    "ADMIN",
                    user
            );
        }


        // ====================================================
        // STUDENT LOGIN
        // ====================================================

        Student student =
                studentRepository
                        .findByUidOrEmail(
                                identifier,
                                identifier
                        )
                        .orElse(null);


        if (student != null) {

            if (!passwordEncoder.matches(
                    password,
                    student.getPassword()
            )) {

                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED,
                        "Invalid credentials"
                );
            }

            if (Boolean.FALSE.equals(student.getActive())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN,
                        "Account is inactive"
                );
            }


            String token =
                    jwtService.generateToken(
                            student.getUid(),
                            "STUDENT",
                            student.getId()
                    );


            UserResponse user =
                    createStudentResponse(student);


            return new LoginResponse(
                    token,
                    "STUDENT",
                    user
            );
        }


        // ====================================================
        // FACULTY LOGIN
        // ====================================================

        Faculty faculty =
                facultyRepository
                        .findByFacultyId(identifier)
                        .orElse(null);


        if (faculty == null) {

            faculty =
                    facultyRepository
                            .findByEmail(identifier)
                            .orElse(null);
        }


        if (faculty != null) {

            if (!passwordEncoder.matches(
                    password,
                    faculty.getPassword()
            )) {

                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED,
                        "Invalid credentials"
                );
            }

            if (Boolean.FALSE.equals(faculty.getActive())) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.FORBIDDEN,
                        "Account is inactive"
                );
            }


            String token =
                    jwtService.generateToken(
                            faculty.getFacultyId(),
                            "FACULTY",
                            faculty.getId()
                    );


            UserResponse user =
                    createFacultyResponse(faculty);


            return new LoginResponse(
                    token,
                    "FACULTY",
                    user
            );
        }


        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Invalid credentials"
        );
    }


    // ========================================================
    // STUDENT RESPONSE
    // ========================================================

    private UserResponse createStudentResponse(
            Student student
    ) {

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
        response.setActive(
                student.getActive() != null ? student.getActive() : true
        );

        return response;
    }


    // ========================================================
    // FACULTY RESPONSE
    // ========================================================

    private UserResponse createFacultyResponse(
            Faculty faculty
    ) {

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

        response.setActive(
                faculty.getActive() != null ? faculty.getActive() : true
        );

        return response;
    }


    // ========================================================
    // GET STUDENT BY UID
    // ========================================================

    public Student getStudentByUid(
            String uid
    ) {

        return studentRepository
                .findByUid(uid)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student not found"
                        )
                );
    }


    // ========================================================
    // GET FACULTY BY ID
    // ========================================================

    public Faculty getFacultyById(
            String facultyId
    ) {

        return facultyRepository
                .findByFacultyId(facultyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Faculty not found"
                        )
                );
    }
}