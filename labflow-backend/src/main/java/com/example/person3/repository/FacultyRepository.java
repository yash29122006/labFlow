package com.example.person3.repository;

import com.example.person3.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByFacultyId(String facultyId);

    Optional<Faculty> findByEmail(String email);

    boolean existsByFacultyId(String facultyId);

    boolean existsByEmail(String email);
}