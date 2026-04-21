package com.codexpoetica.backend.common.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private Integer code;
    private String message;
    private T data;
    private String traceId;

    public static <T> ApiResponse<T> success(T data, String traceId) {
        return ApiResponse.<T>builder()
                .code(0)
                .message("ok")
                .data(data)
                .traceId(traceId)
                .build();
    }

    public static <T> ApiResponse<T> fail(Integer code, String message, String traceId) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(message)
                .data(null)
                .traceId(traceId)
                .build();
    }
}
