package com.example.person3.service;

import com.example.person3.entity.FacultySubject;
import com.example.person3.entity.Subject;
import com.example.person3.repository.FacultyRepository;
import com.example.person3.repository.FacultySubjectRepository;
import com.example.person3.repository.SubjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FacultySubjectService {

    private final FacultySubjectRepository facultySubjectRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;

    public FacultySubjectService(
            FacultySubjectRepository facultySubjectRepository,
            FacultyRepository facultyRepository,
            SubjectRepository subjectRepository) {
        this.facultySubjectRepository = facultySubjectRepository;
        this.facultyRepository = facultyRepository;
        this.subjectRepository = subjectRepository;
    }

    public void assignSubject(Long facultyId, Long subjectId) {
        ensureFacultyExists(facultyId);
        ensureSubjectExists(subjectId);

        if (facultySubjectRepository.existsByFacultyIdAndSubjectId(facultyId, subjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Subject is already assigned to this faculty"
            );
        }

        facultySubjectRepository.save(
                new FacultySubject(facultyId, subjectId)
        );
    }

    public boolean removeSubject(Long facultyId, Long subjectId) {
        ensureFacultyExists(facultyId);
        ensureSubjectExists(subjectId);

        if (!facultySubjectRepository.existsByFacultyIdAndSubjectId(facultyId, subjectId)) {
            return false;
        }

        facultySubjectRepository.deleteByFacultyIdAndSubjectId(
                facultyId,
                subjectId
        );
        return true;
    }

    public List<Subject> getSubjectsForFaculty(Long facultyId) {
        ensureFacultyExists(facultyId);

        List<Long> subjectIds = facultySubjectRepository
                .findByFacultyId(facultyId)
                .stream()
                .map(FacultySubject::getSubjectId)
                .toList();

        if (subjectIds.isEmpty()) {
            return List.of();
        }

        return subjectRepository.findAllById(subjectIds);
    }

    public boolean isAssigned(Long facultyId, Long subjectId) {
        return facultySubjectRepository.existsByFacultyIdAndSubjectId(
                facultyId,
                subjectId
        );
    }

    private void ensureFacultyExists(Long facultyId) {
        if (!facultyRepository.existsById(facultyId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Faculty not found"
            );
        }
    }

    private void ensureSubjectExists(Long subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Subject not found"
            );
        }
    }
}
