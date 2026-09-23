package com.example.person3.repository;

import com.example.person3.entity.QuizResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QuizResponseRepository extends JpaRepository<QuizResponse, Long> {

    Optional<QuizResponse> findByQuizIdAndStudentId(
            Long quizId,
            Long studentId
    );

    List<QuizResponse> findByStudentId(Long studentId);

    List<QuizResponse> findByQuizIdInAndStudentId(
            Collection<Long> quizIds,
            Long studentId
    );
}
