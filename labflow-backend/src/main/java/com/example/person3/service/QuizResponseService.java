package com.example.person3.service;

import com.example.person3.dto.QuizResponseRequest;
import com.example.person3.entity.Assignment;
import com.example.person3.entity.Quiz;
import com.example.person3.entity.QuizResponse;
import com.example.person3.entity.QuizType;
import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.QuizRepository;
import com.example.person3.repository.QuizResponseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizResponseService {

    private final QuizRepository quizRepository;
    private final QuizResponseRepository quizResponseRepository;
    private final AssignmentRepository assignmentRepository;
    private final AcademicAccessService academicAccessService;

    public QuizResponseService(
            QuizRepository quizRepository,
            QuizResponseRepository quizResponseRepository,
            AssignmentRepository assignmentRepository,
            AcademicAccessService academicAccessService) {

        this.quizRepository = quizRepository;
        this.quizResponseRepository = quizResponseRepository;
        this.assignmentRepository = assignmentRepository;
        this.academicAccessService = academicAccessService;
    }

    @Transactional
    public List<QuizResponse> submitAssignmentQuiz(
            Long assignmentId,
            List<QuizResponseRequest> requests,
            Long studentId) {

        if (requests == null || requests.isEmpty()) {
            throw new IllegalArgumentException("At least one answer is required");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        academicAccessService.requireStudentAssignmentAccess(studentId, assignmentId);

        if (!Boolean.TRUE.equals(assignment.getIsOpen())) {
            throw new IllegalStateException("This assignment is closed");
        }

        // Load every submitted quiz in one query instead of one SELECT per answer.
        List<Long> quizIds = requests.stream()
                .map(QuizResponseRequest::getQuizId)
                .distinct()
                .toList();

        Map<Long, Quiz> quizMap = new HashMap<>();
        for (Quiz quiz : quizRepository.findAllById(quizIds)) {
            quizMap.put(quiz.getId(), quiz);
        }

        if (quizMap.size() != quizIds.size()) {
            throw new IllegalArgumentException("One or more quizzes do not exist");
        }

        // Protect against submitting a quiz belonging to another assignment.
        for (Long quizId : quizIds) {
            Quiz quiz = quizMap.get(quizId);
            if (!assignmentId.equals(quiz.getAssignmentId())) {
                throw new IllegalArgumentException(
                        "Quiz " + quizId + " does not belong to assignment " + assignmentId
                );
            }
        }

        // Load existing answers in one query and update them in memory.
        Map<Long, QuizResponse> existing = new HashMap<>();
        for (QuizResponse response : quizResponseRepository
                .findByQuizIdInAndStudentId(quizIds, studentId)) {
            existing.put(response.getQuizId(), response);
        }

        Map<Long, QuizResponse> responseMap = new LinkedHashMap<>();

        for (QuizResponseRequest request : requests) {
            Quiz quiz = quizMap.get(request.getQuizId());
            validateAnswer(quiz, request.getAnswer());

            QuizResponse response = existing.getOrDefault(
                    request.getQuizId(),
                    new QuizResponse()
            );

            response.setQuizId(request.getQuizId());
            response.setStudentId(studentId);
            response.setAnswer(request.getAnswer());
            responseMap.put(request.getQuizId(), response);
        }

        // Hibernate batching reduces the number of round-trips for inserts/updates.
        return quizResponseRepository.saveAll(responseMap.values());
    }

    /**
     * Kept for compatibility with existing callers. The assignment-level
     * endpoint now uses the batch implementation above.
     */
    public QuizResponse submitResponse(
            QuizResponseRequest request,
            Long studentId,
            Long assignmentId) {

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        if (!quiz.getAssignmentId().equals(assignmentId)) {
            throw new IllegalArgumentException(
                    "Quiz " + quiz.getId() +
                            " does not belong to assignment " + assignmentId
            );
        }

        validateAnswer(quiz, request.getAnswer());

        QuizResponse response = quizResponseRepository
                .findByQuizIdAndStudentId(request.getQuizId(), studentId)
                .orElseGet(QuizResponse::new);

        response.setQuizId(request.getQuizId());
        response.setStudentId(studentId);
        response.setAnswer(request.getAnswer());

        return quizResponseRepository.save(response);
    }

    private void validateAnswer(Quiz quiz, String answer) {
        if (answer == null || answer.isBlank()) {
            throw new IllegalArgumentException("Answer cannot be empty");
        }

        if (quiz.getType() == QuizType.MCQ) {
            String normalized = answer.toUpperCase();
            if (!normalized.matches("[ABCD]")) {
                throw new IllegalArgumentException(
                        "MCQ answer must be A, B, C or D"
                );
            }
        }
    }
}
