package com.example.person3.controller;

import com.example.person3.dto.UserResponse;
import com.example.person3.entity.Student;
import com.example.person3.service.AcademicAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/faculty/students")
public class FacultyStudentController {

    private final AcademicAccessService academicAccessService;

    public FacultyStudentController(AcademicAccessService academicAccessService) {
        this.academicAccessService = academicAccessService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getMyStudents(@RequestAttribute("userId") Long facultyId) {
        List<Student> students = academicAccessService.getStudentsForFaculty(facultyId);
        List<UserResponse> responses = students.stream().map(student -> {
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
        }).toList();

        return ResponseEntity.ok(responses);
    }
}
