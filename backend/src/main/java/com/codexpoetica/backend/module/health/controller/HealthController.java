package com.codexpoetica.backend.module.health.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, Object>> health(HttpServletRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "codex-poetica-backend");
        data.put("time", LocalDateTime.now().toString());
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }
}
