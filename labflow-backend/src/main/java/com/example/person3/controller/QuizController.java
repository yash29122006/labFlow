package com.example.person3.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.person3.dto.QuizRequest;
import com.example.person3.dto.QuizResponseRequest;
import com.example.person3.dto.QuizViewResponse;
import com.example.person3.entity.Quiz;
import com.example.person3.entity.QuizResponse;
import com.example.person3.service.QuizResponseService;
import com.example.person3.service.QuizService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin
public class QuizController {

    private final QuizService quizService;
    private final QuizResponseService quizResponseService;

    public QuizController(
            QuizService quizService,
            QuizResponseService quizResponseService) {

        this.quizService = quizService;
        this.quizResponseService = quizResponseService;
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @Valid @RequestBody QuizRequest request,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                quizService.createQuiz(request, facultyId)
        );
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<QuizViewResponse>> getQuizzesByAssignment(
            @PathVariable Long assignmentId,
            Authentication authentication,
            @RequestAttribute("userId") Long userId) {

        boolean faculty = hasRole(authentication, "FACULTY");
        String role = faculty ? "FACULTY" : "STUDENT";

        List<QuizViewResponse> response = quizService
                .getQuizzesByAssignment(assignmentId, role, userId)
                .stream()
                .map(quiz -> toViewResponse(quiz, faculty))
                .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(
            @PathVariable Long id,
            @Valid @RequestBody QuizRequest request,
            @RequestAttribute("userId") Long facultyId) {

        return ResponseEntity.ok(
                quizService.updateQuiz(id, request, facultyId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long id,
            @RequestAttribute("userId") Long facultyId) {

        quizService.deleteQuiz(id, facultyId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assignment/{assignmentId}/submit")
    public ResponseEntity<List<QuizResponse>> submitQuizAnswers(
            @PathVariable Long assignmentId,
            @RequestBody List<QuizResponseRequest> requests,
            @RequestAttribute("userId") Long studentId) {

        return ResponseEntity.ok(
                quizResponseService.submitAssignmentQuiz(
                        assignmentId,
                        requests,
                        studentId
                )
        );
    }

    private QuizViewResponse toViewResponse(Quiz quiz, boolean includeCorrectAnswer) {
        QuizViewResponse response = new QuizViewResponse();
        response.setId(quiz.getId());
        response.setAssignmentId(quiz.getAssignmentId());
        response.setQuestion(quiz.getQuestion());
        response.setType(quiz.getType());
        response.setOptionA(quiz.getOptionA());
        response.setOptionB(quiz.getOptionB());
        response.setOptionC(quiz.getOptionC());
        response.setOptionD(quiz.getOptionD());
        response.setMarks(quiz.getMarks());

        if (includeCorrectAnswer) {
            response.setCorrectAnswer(quiz.getCorrectAnswer());
        }

        return response;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_" + role)
                );
    }
}
