package com.example.person3.service;

import com.example.person3.dto.SubjectRequest;
import com.example.person3.entity.Subject;
import com.example.person3.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public Subject createSubject(SubjectRequest request) {
        Subject subject = new Subject();
        apply(request, subject);
        return subjectRepository.save(subject);
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    public Optional<Subject> getSubjectById(Long id) {
        return subjectRepository.findById(id);
    }

    public Optional<Subject> updateSubject(Long id, SubjectRequest request) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    apply(request, subject);
                    return subjectRepository.save(subject);
                });
    }

    public boolean deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) {
            return false;
        }
        subjectRepository.deleteById(id);
        return true;
    }

    public List<Subject> getMySubjects(String department, Integer academicYear, Integer semester) {
        return subjectRepository.findByDepartmentAndAcademicYearAndSemester(
                department, academicYear, semester);
    }

    private void apply(SubjectRequest request, Subject subject) {
        subject.setName(request.getName());
        subject.setCode(request.getCode());
        subject.setDepartment(request.getDepartment());
        subject.setAcademicYear(request.getAcademicYear());
        subject.setSemester(request.getSemester());
    }
}
