package com.Olysea.backend.common.exception;

import com.Olysea.backend.common.response.ApiErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();

        request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setRequestURI("/api/projects/999");
    }

    @Test
    void handleNotFoundReturns404AndStandardErrorBody() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Project not found.");

        ResponseEntity<ApiErrorResponse> response = handler.handleNotFound(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();

        ApiErrorResponse body = response.getBody();
        assertThat(body.status()).isEqualTo(404);
        assertThat(body.error()).isEqualTo("Not Found");
        assertThat(body.message()).isEqualTo("Project not found.");
        assertThat(body.path()).isEqualTo("/api/projects/999");
        assertThat(body.timestamp()).isNotNull();
        assertThat(body.fields()).isEmpty();
    }

    @Test
    void handleTooManyRequestsReturns429AndStandardErrorBody() {
        TooManyRequestsException exception = new TooManyRequestsException("Too many requests.");

        ResponseEntity<ApiErrorResponse> response = handler.handleTooManyRequests(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(response.getBody()).isNotNull();

        ApiErrorResponse body = response.getBody();
        assertThat(body.status()).isEqualTo(429);
        assertThat(body.error()).isEqualTo("Too Many Requests");
        assertThat(body.message()).isEqualTo("Too many requests.");
        assertThat(body.path()).isEqualTo("/api/projects/999");
        assertThat(body.timestamp()).isNotNull();
        assertThat(body.fields()).isEmpty();
    }

    @Test
    void handleConflictReturns409AndStandardErrorBody() {
        ConflictException exception = new ConflictException("Resource already exists.");

        ResponseEntity<ApiErrorResponse> response = handler.handleConflict(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();

        ApiErrorResponse body = response.getBody();
        assertThat(body.status()).isEqualTo(409);
        assertThat(body.error()).isEqualTo("Conflict");
        assertThat(body.message()).isEqualTo("Resource already exists.");
        assertThat(body.fields()).isEmpty();
    }

    @Test
    void handleDataConflictReturns409() {
        DataIntegrityViolationException exception = new DataIntegrityViolationException("Duplicate key error");

        ResponseEntity<ApiErrorResponse> response = handler.handleDataConflict(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("The request conflicts with existing data.");
    }

    @Test
    void handleUnreadableBodyReturns400() {
        HttpMessageNotReadableException exception = new HttpMessageNotReadableException("JSON parse error", (org.springframework.http.HttpInputMessage) null);

        ResponseEntity<ApiErrorResponse> response = handler.handleUnreadableBody(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("The request body is missing or invalid.");
    }

    @Test
    void handleValidationReturns400WithFieldErrors() {
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "projectRequest");
        bindingResult.addError(new FieldError("projectRequest", "title", "Title is required"));

        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ApiErrorResponse> response = handler.handleValidation(exception, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Validation failed.");
        assertThat(response.getBody().fields()).containsEntry("title", "Title is required");
    }
}
