package com.codexpoetica.backend.module.work.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import com.codexpoetica.backend.common.util.VisitorIdUtil;
import com.codexpoetica.backend.module.work.dto.WorkListItem;
import com.codexpoetica.backend.module.work.dto.WorkRequest;
import com.codexpoetica.backend.module.work.dto.WorkResponse;
import com.codexpoetica.backend.module.work.service.WorkService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/works")
@RequiredArgsConstructor
public class WorkController {

    private final WorkService workService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<WorkResponse> create(@RequestBody WorkRequest req, HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        WorkResponse data = workService.create(visitorId, req);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }

    @PutMapping("/{workId}")
    public ApiResponse<WorkResponse> update(@PathVariable String workId,
                                            @RequestBody WorkRequest req,
                                            HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        WorkResponse data = workService.update(visitorId, workId, req);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }

    @GetMapping("/{workId}")
    public ApiResponse<WorkResponse> getById(@PathVariable String workId, HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        WorkResponse data = workService.getById(visitorId, workId);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }

    @GetMapping
    public ApiResponse<List<WorkListItem>> list(HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        List<WorkListItem> data = workService.listByVisitor(visitorId);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }

    @DeleteMapping("/{workId}")
    public ApiResponse<Void> delete(@PathVariable String workId, HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        workService.delete(visitorId, workId);
        return ApiResponse.success(null, TraceIdUtil.getTraceId(request));
    }
}
