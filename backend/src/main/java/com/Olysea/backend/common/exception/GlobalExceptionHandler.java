
package com.Olysea.backend.common.exception;

import com.Olysea.backend.common.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleNotFound(
                        ResourceNotFoundException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                ex.getMessage(),
                                request,
                                Map.of());
        }

        @ExceptionHandler(ConflictException.class)
        public ResponseEntity<ApiErrorResponse> handleConflict(
                        ConflictException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.CONFLICT,
                                ex.getMessage(),
                                request,
                                Map.of());
        }

        @ExceptionHandler(TooManyRequestsException.class)
        public ResponseEntity<ApiErrorResponse> handleTooManyRequests(
                        TooManyRequestsException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.TOO_MANY_REQUESTS,
                                ex.getMessage(),
                                request,
                                Map.of());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidation(
                        MethodArgumentNotValidException ex,
                        HttpServletRequest request) {

                Map<String, String> fields = new LinkedHashMap<>();

                ex.getBindingResult().getFieldErrors().forEach(error -> fields.putIfAbsent(
                                error.getField(),
                                error.getDefaultMessage() == null
                                                ? "Invalid value."
                                                : error.getDefaultMessage()));

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed.",
                                request,
                                fields);
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
                        ConstraintViolationException ex,
                        HttpServletRequest request) {

                Map<String, String> fields = new LinkedHashMap<>();

                ex.getConstraintViolations().forEach(violation -> fields.putIfAbsent(
                                violation.getPropertyPath().toString(),
                                violation.getMessage()));

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed.",
                                request,
                                fields);
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.BAD_REQUEST,
                                "The request body is missing or invalid.",
                                request,
                                Map.of());
        }

        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleMissingResource(
                        NoResourceFoundException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.NOT_FOUND,
                                "The requested resource was not found.",
                                request,
                                Map.of());
        }

        @ExceptionHandler(DataIntegrityViolationException.class)
        public ResponseEntity<ApiErrorResponse> handleDataConflict(
                        DataIntegrityViolationException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.CONFLICT,
                                "The request conflicts with existing data.",
                                request,
                                Map.of());
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiErrorResponse> handleAuthenticationException(
                        AuthenticationException ex,
                        HttpServletRequest request) {

                return buildResponse(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password.",
                                request,
                                Map.of());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiErrorResponse> handleUnexpected(
                        Exception ex,
                        HttpServletRequest request) {

                log.error(
                                "Unexpected error while handling {} {}",
                                request.getMethod(),
                                request.getRequestURI(),
                                ex);

                return buildResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "An unexpected error occurred.",
                                request,
                                Map.of());
        }

        private ResponseEntity<ApiErrorResponse> buildResponse(
                        HttpStatus status,
                        String message,
                        HttpServletRequest request,
                        Map<String, String> fields) {

                ApiErrorResponse body = new ApiErrorResponse(
                                Instant.now(),
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                request.getRequestURI(),
                                fields);

                return ResponseEntity.status(status).body(body);
        }
}
