package com.example.person3.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "faculty",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_faculty_faculty_id",
                        columnNames = "faculty_id"
                ),
                @UniqueConstraint(
                        name = "uk_faculty_email",
                        columnNames = "email"
                )
        }
)
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "faculty_id",
            nullable = false,
            unique = true,
            length = 50
    )
    private String facultyId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "role", nullable = false, length = 20)
    private String role = "FACULTY";

    @Column(name = "active", nullable = false)
    private Boolean active = true;


    public Faculty() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(String facultyId) {
        this.facultyId = facultyId;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }


    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}