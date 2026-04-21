package com.codexpoetica.backend.module.parse.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import com.codexpoetica.backend.module.parse.dto.ParseRequest;
import com.codexpoetica.backend.module.parse.dto.ParseResponse;
import com.codexpoetica.backend.module.parse.service.ParseService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/parse")
@RequiredArgsConstructor
public class ParseController {

    private final ParseService parseService;

    @PostMapping
    public ApiResponse<ParseResponse> parse(@RequestBody ParseRequest req, HttpServletRequest request) {
        ParseResponse data = parseService.parse(req);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }
}
