package com.example.person3.service;

import com.example.person3.dto.FacultyRequest;
import com.example.person3.entity.Faculty;
import com.example.person3.repository.FacultyRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminFacultyService {

    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminFacultyService(
            FacultyRepository facultyRepository,
            PasswordEncoder passwordEncoder) {
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Faculty createFaculty(FacultyRequest request) {
        if (facultyRepository.existsByFacultyId(request.getFacultyId())) {
            throw new IllegalArgumentException("Faculty ID already exists");
        }

        if (facultyRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        Faculty faculty = new Faculty();
        faculty.setFacultyId(request.getFacultyId());
        faculty.setName(request.getName());
        faculty.setDepartment(request.getDepartment());
        faculty.setEmail(request.getEmail());
        faculty.setPassword(passwordEncoder.encode(request.getPassword()));
        faculty.setRole("FACULTY");

        return facultyRepository.save(faculty);
    }

    public List<Faculty> getAllFaculty() {
        return facultyRepository.findAll();
    }

    public boolean deleteFaculty(Long id) {
        return facultyRepository.findById(id)
                .map(faculty -> {
                    facultyRepository.delete(faculty);
                    return true;
                })
                .orElse(false);
    }

    public Faculty updateFacultyStatus(Long id, Boolean active) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));
        faculty.setActive(active);
        return facultyRepository.save(faculty);
    }
}
