package com.example.person3.client;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.person3.dto.CodeExecutionRequest;

@Component
public class Judge0Client {

    private final RestTemplate restTemplate;

    @Value("${judge0.url}")
    private String judge0Url;

    @Value("${judge0.api-key:}")
    private String judge0ApiKey;

    public Judge0Client(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Map<String, Object> execute(
            CodeExecutionRequest request
    ) {

        Map<String, Object> submission = new HashMap<>();

        submission.put(
                "language_id",
                request.getLanguageId()
        );

        submission.put(
                "source_code",
                Base64.getEncoder().encodeToString(
                        request.getSourceCode()
                                .getBytes(StandardCharsets.UTF_8)
                )
        );

        if (request.getStdin() != null &&
                !request.getStdin().isEmpty()) {

            submission.put(
                    "stdin",
                    Base64.getEncoder().encodeToString(
                            request.getStdin()
                                    .getBytes(StandardCharsets.UTF_8)
                    )
            );
        }

        HttpHeaders headers = createHeaders();

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(submission, headers);

        ResponseEntity<Map> submitResponse =
                restTemplate.postForEntity(
                        judge0Url +
                                "/submissions?base64_encoded=true&wait=false",
                        entity,
                        Map.class
                );

        if (!submitResponse.getStatusCode().is2xxSuccessful()
                || submitResponse.getBody() == null) {

            throw new RuntimeException(
                    "Failed to submit code to Judge0"
            );
        }

        Object tokenObject =
                submitResponse.getBody().get("token");

        if (tokenObject == null) {
            throw new RuntimeException(
                    "Judge0 did not return a submission token"
            );
        }

        String token = tokenObject.toString();

        return getResult(token);
    }

    private Map<String, Object> getResult(String token) {

        String resultUrl =
                judge0Url +
                        "/submissions/" +
                        token +
                        "?base64_encoded=true";

        HttpHeaders headers = createHeaders();

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        for (int attempt = 0; attempt < 30; attempt++) {

            ResponseEntity<Map> response =
                    restTemplate.exchange(
                            resultUrl,
                            HttpMethod.GET,
                            entity,
                            Map.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()
                    || response.getBody() == null) {

                throw new RuntimeException(
                        "Failed to get Judge0 result"
                );
            }

            Map<String, Object> result =
                    response.getBody();

            Map<String, Object> status =
                    (Map<String, Object>) result.get("status");

            if (status != null) {

                Object statusId =
                        status.get("id");

                if (statusId != null) {

                    int id =
                            Integer.parseInt(
                                    statusId.toString()
                            );

                    /*
                     * Judge0:
                     * 1 = In Queue
                     * 2 = Processing
                     *
                     * Any status >= 3 is a finished result.
                     */
                    if (id >= 3) {

                        decodeResult(result);

                        return result;
                    }
                }
            }

            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {

                Thread.currentThread().interrupt();

                throw new RuntimeException(
                        "Judge0 execution was interrupted",
                        e
                );
            }
        }

        throw new RuntimeException(
                "Judge0 execution timed out"
        );
    }

    private void decodeResult(
            Map<String, Object> result
    ) {

        decodeField(result, "stdout");
        decodeField(result, "stderr");
        decodeField(result, "compile_output");
        decodeField(result, "message");
    }

    private void decodeField(
            Map<String, Object> result,
            String field
    ) {

        Object value = result.get(field);

        if (value instanceof String &&
                !((String) value).isEmpty()) {

            try {

                byte[] decoded =
                        Base64.getDecoder().decode(
                                (String) value
                        );

                result.put(
                        field,
                        new String(
                                decoded,
                                StandardCharsets.UTF_8
                        )
                );

            } catch (IllegalArgumentException ignored) {
                // Field was not Base64 encoded.
            }
        }
    }

    private HttpHeaders createHeaders() {

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        if (judge0ApiKey != null &&
                !judge0ApiKey.isBlank()) {

            headers.set(
                    "X-Auth-Token",
                    judge0ApiKey
            );
        }

        return headers;
    }
}