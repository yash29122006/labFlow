package com.example.person3.service;

import com.example.person3.dto.AssignmentRequest;
import com.example.person3.entity.Assignment;
import com.example.person3.entity.SubjectAssignment;
import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.SubjectAssignmentRepository;
import com.example.person3.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectAssignmentRepository subjectAssignmentRepository;
    private final AcademicAccessService academicAccessService;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            SubjectRepository subjectRepository,
            SubjectAssignmentRepository subjectAssignmentRepository,
            AcademicAccessService academicAccessService) {
        this.assignmentRepository = assignmentRepository;
        this.subjectRepository = subjectRepository;
        this.subjectAssignmentRepository = subjectAssignmentRepository;
        this.academicAccessService = academicAccessService;
    }

    @Transactional
    public Assignment createAssignment(AssignmentRequest request, Long facultyId) {
        validateSubjectIds(request.getSubjectIds());
        academicAccessService.requireFacultyAllSubjectsAccess(
                facultyId,
                request.getSubjectIds()
        );

        Assignment assignment = new Assignment();
        apply(request, assignment);
        Assignment saved = assignmentRepository.save(assignment);

        saveSubjectLinks(saved.getId(), request.getSubjectIds());
        return saved;
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    /** Single SQL set-based query; no assignment-by-assignment access checks. */
    public List<Assignment> getAllAssignmentsForFaculty(Long facultyId) {
        return assignmentRepository.findAllForFaculty(facultyId);
    }

    /** Single SQL query for all open assignments eligible for the student. */
    public List<Assignment> getAllAssignmentsForStudent(Long studentId) {
        return assignmentRepository.findAllOpenForStudent(studentId);
    }

    public Optional<Assignment> getAssignmentById(Long id) {
        return assignmentRepository.findById(id);
    }

    public Assignment getAssignmentByIdForFaculty(Long id, Long facultyId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        academicAccessService.requireFacultyAssignmentAccess(facultyId, id);
        return assignment;
    }

    public Assignment getAssignmentByIdForStudent(Long id, Long studentId) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        academicAccessService.requireStudentAssignmentAccess(studentId, id);

        if (!Boolean.TRUE.equals(assignment.getIsOpen())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This assignment is closed"
            );
        }

        return assignment;
    }

    /** Single JOIN query instead of link lookup + entity lookup. */
    public List<Assignment> getAssignmentsBySubject(Long subjectId) {
        return assignmentRepository.findAllBySubjectId(subjectId);
    }

    /** One authorization query + one set-based assignment query. */
    public List<Assignment> getAssignmentsBySubjectForFaculty(Long subjectId, Long facultyId) {
        academicAccessService.requireFacultySubjectAccess(facultyId, subjectId);
        return assignmentRepository.findAllBySubjectIdForFaculty(subjectId, facultyId);
    }

    /** One authorization query + one assignment query. */
    public List<Assignment> getAssignmentsBySubjectForStudent(Long subjectId, Long studentId) {
        academicAccessService.requireStudentSubjectAccess(studentId, subjectId);
        return assignmentRepository.findAllOpenBySubjectId(subjectId);
    }

    @Transactional
    public Optional<Assignment> updateAssignment(
            Long id,
            AssignmentRequest request,
            Long facultyId) {

        Optional<Assignment> optional = assignmentRepository.findById(id);
        if (optional.isEmpty()) {
            return Optional.empty();
        }

        Assignment assignment = optional.get();

        List<Long> targetSubjectIds;
        if (request.getSubjectIds() != null) {
            validateSubjectIds(request.getSubjectIds());
            targetSubjectIds = request.getSubjectIds();
        } else {
            targetSubjectIds = subjectAssignmentRepository.findByAssignmentId(id)
                    .stream()
                    .map(SubjectAssignment::getSubjectId)
                    .toList();
        }

        academicAccessService.requireFacultyAllSubjectsAccess(
                facultyId,
                targetSubjectIds
        );

        apply(request, assignment);

        if (request.getSubjectIds() != null) {
            subjectAssignmentRepository.deleteByAssignmentId(id);
            saveSubjectLinks(id, request.getSubjectIds());
        }

        return Optional.of(assignmentRepository.save(assignment));
    }

    @Transactional
    public boolean deleteAssignment(Long id, Long facultyId) {
        if (!assignmentRepository.existsById(id)) {
            return false;
        }

        academicAccessService.requireFacultyAssignmentAccess(facultyId, id);
        subjectAssignmentRepository.deleteByAssignmentId(id);
        assignmentRepository.deleteById(id);
        return true;
    }

    public Optional<Assignment> openAssignment(Long id, Long facultyId) {
        return setOpen(id, true, facultyId);
    }

    public Optional<Assignment> closeAssignment(Long id, Long facultyId) {
        return setOpen(id, false, facultyId);
    }

    private Optional<Assignment> setOpen(Long id, boolean value, Long facultyId) {
        Optional<Assignment> optional = assignmentRepository.findById(id);
        if (optional.isEmpty()) {
            return Optional.empty();
        }

        academicAccessService.requireFacultyAssignmentAccess(facultyId, id);

        Assignment assignment = optional.get();
        assignment.setIsOpen(value);
        return Optional.of(assignmentRepository.save(assignment));
    }

    private void apply(AssignmentRequest request, Assignment assignment) {
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setInstructions(request.getInstructions());
        assignment.setIsOpen(request.getIsOpen());
        assignment.setDueDate(request.getDueDate());
        assignment.setQuizTimeLimitMinutes(request.getQuizTimeLimitMinutes());
    }

    private void validateSubjectIds(List<Long> subjectIds) {
        if (subjectIds == null || subjectIds.isEmpty()) {
            throw new IllegalArgumentException("At least one subject is required");
        }

        Set<Long> uniqueIds = new LinkedHashSet<>(subjectIds);
        long existingCount = subjectRepository.countByIdIn(uniqueIds);

        if (existingCount != uniqueIds.size()) {
            throw new IllegalArgumentException("One or more subjects do not exist");
        }
    }

    private void saveSubjectLinks(Long assignmentId, List<Long> subjectIds) {
        Set<Long> uniqueIds = new LinkedHashSet<>(subjectIds);
        List<SubjectAssignment> links = new ArrayList<>(uniqueIds.size());

        for (Long subjectId : uniqueIds) {
            links.add(new SubjectAssignment(subjectId, assignmentId));
        }

        subjectAssignmentRepository.saveAll(links);
    }
}
