package com.codexpoetica.backend.common.advice;

import com.codexpoetica.backend.common.exception.BizException;
import com.codexpoetica.backend.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBizException(BizException ex, HttpServletRequest request) {
        return ApiResponse.fail(ex.getCode(), ex.getMessage(), getTraceId(request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ApiResponse.fail(4000, msg, getTraceId(request));
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleException(Exception ex, HttpServletRequest request) {
        return ApiResponse.fail(5000, "internal server error", getTraceId(request));
    }

    private String getTraceId(HttpServletRequest request) {
        Object traceId = request.getAttribute("traceId");
        return traceId != null ? traceId.toString() : "";
    }
}
