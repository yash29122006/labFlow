package com.example.person3.repository;

import com.example.person3.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findBySubmissionId(Long submissionId);

    List<Evaluation> findBySubmissionIdIn(List<Long> submissionIds);

    List<Evaluation> findBySubmissionIdInAndPublishedTrue(List<Long> submissionIds);
}
