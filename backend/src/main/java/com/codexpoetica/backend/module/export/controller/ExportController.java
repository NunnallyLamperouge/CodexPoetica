package com.codexpoetica.backend.module.export.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import com.codexpoetica.backend.common.util.VisitorIdUtil;
import com.codexpoetica.backend.module.export.dto.ExportRequest;
import com.codexpoetica.backend.module.export.service.ExportRecordService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/exports")
@RequiredArgsConstructor
public class ExportController {

    private final ExportRecordService exportRecordService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> record(@RequestBody ExportRequest req, HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getOptionalVisitorId(request);
        exportRecordService.record(visitorId, req);
        return ApiResponse.success(null, TraceIdUtil.getTraceId(request));
    }
}
