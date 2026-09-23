-- Run this in the Supabase SQL editor before starting the backend.
-- spring.jpa.hibernate.ddl-auto=validate means Hibernate will NOT create
-- this table for you -- it only checks that it already matches the entity.

CREATE TABLE evaluations (
    id             BIGSERIAL PRIMARY KEY,
    submission_id  BIGINT NOT NULL
                   REFERENCES submissions(id)
                   ON DELETE CASCADE,
    correctness    INT NOT NULL CHECK (correctness BETWEEN 0 AND 50),
    quality        INT NOT NULL CHECK (quality BETWEEN 0 AND 30),
    explanation    INT NOT NULL CHECK (explanation BETWEEN 0 AND 20),
    total_marks    INT NOT NULL,
    feedback       TEXT,
    published      BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT uk_evaluations_submission_id UNIQUE (submission_id)
);
