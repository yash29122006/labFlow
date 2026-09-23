package com.example.person3.service;

import com.example.person3.dto.QuizRequest;
import com.example.person3.entity.Assignment;
import com.example.person3.entity.Quiz;
import com.example.person3.entity.QuizType;
import com.example.person3.repository.AssignmentRepository;
import com.example.person3.repository.QuizRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final AssignmentRepository assignmentRepository;
    private final AcademicAccessService academicAccessService;

    public QuizService(
            QuizRepository quizRepository,
            AssignmentRepository assignmentRepository,
            AcademicAccessService academicAccessService) {
        this.quizRepository = quizRepository;
        this.assignmentRepository = assignmentRepository;
        this.academicAccessService = academicAccessService;
    }

    public List<Quiz> getQuizzesByAssignment(Long assignmentId, String role, Long userId) {
        if ("FACULTY".equals(role)) {
            List<Quiz> quizzes = quizRepository.findAccessibleByAssignmentForFaculty(
                    assignmentId, userId);

            if (!quizzes.isEmpty()) {
                return quizzes;
            }

            // Distinguish an empty quiz list from a missing/unauthorized assignment.
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));
            academicAccessService.requireFacultyAssignmentAccess(userId, assignment.getId());
            return quizzes;
        }

        List<Quiz> quizzes = quizRepository.findAccessibleByAssignmentForStudent(
                assignmentId, userId);

        if (!quizzes.isEmpty()) {
            return quizzes;
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        academicAccessService.requireStudentAssignmentAccess(userId, assignmentId);

        if (!Boolean.TRUE.equals(assignment.getIsOpen())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "This assignment is closed"
            );
        }

        return quizzes;
    }

    public Quiz createQuiz(QuizRequest request, Long facultyId) {

        validateQuiz(request);

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                assignment.getId()
        );

        Quiz quiz = new Quiz();
        apply(request, quiz);
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(Long id, QuizRequest request, Long facultyId) {

        validateQuiz(request);

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                assignment.getId()
        );

        quiz.setAssignmentId(assignment.getId());
        quiz.setQuestion(request.getQuestion());
        quiz.setType(request.getType());
        quiz.setMarks(request.getMarks());

        if (request.getType() == QuizType.MCQ) {
            quiz.setOptionA(request.getOptionA());
            quiz.setOptionB(request.getOptionB());
            quiz.setOptionC(request.getOptionC());
            quiz.setOptionD(request.getOptionD());
            quiz.setCorrectAnswer(request.getCorrectAnswer().toUpperCase());
        } else {
            quiz.setOptionA(null);
            quiz.setOptionB(null);
            quiz.setOptionC(null);
            quiz.setOptionD(null);
            quiz.setCorrectAnswer(null);
        }

        return quizRepository.save(quiz);
    }

    public void deleteQuiz(Long id, Long facultyId) {

        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        academicAccessService.requireFacultyAssignmentAccess(
                facultyId,
                quiz.getAssignmentId()
        );

        quizRepository.delete(quiz);
    }

    private void apply(QuizRequest request, Quiz quiz) {
        quiz.setAssignmentId(request.getAssignmentId());
        quiz.setQuestion(request.getQuestion());
        quiz.setType(request.getType());
        quiz.setMarks(request.getMarks());

        if (request.getType() == QuizType.MCQ) {
            quiz.setOptionA(request.getOptionA());
            quiz.setOptionB(request.getOptionB());
            quiz.setOptionC(request.getOptionC());
            quiz.setOptionD(request.getOptionD());
            quiz.setCorrectAnswer(request.getCorrectAnswer().toUpperCase());
        }
    }

    private void validateQuiz(QuizRequest request) {

        if (request.getType() == QuizType.MCQ) {

            if (request.getOptionA() == null ||
                    request.getOptionB() == null ||
                    request.getOptionC() == null ||
                    request.getOptionD() == null) {

                throw new IllegalArgumentException(
                        "All four options are required for MCQ"
                );
            }

            if (request.getCorrectAnswer() == null) {
                throw new IllegalArgumentException(
                        "Correct answer is required for MCQ"
                );
            }

            String answer = request.getCorrectAnswer().toUpperCase();

            if (!answer.matches("[ABCD]")) {
                throw new IllegalArgumentException(
                        "Correct answer must be A, B, C or D"
                );
            }
        }
    }
}
