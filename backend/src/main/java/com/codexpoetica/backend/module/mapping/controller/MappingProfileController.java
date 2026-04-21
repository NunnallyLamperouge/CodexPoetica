package com.codexpoetica.backend.module.mapping.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import com.codexpoetica.backend.module.mapping.dto.MappingProfileResponse;
import com.codexpoetica.backend.module.mapping.service.MappingProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mapping-profiles")
@RequiredArgsConstructor
public class MappingProfileController {

    private final MappingProfileService mappingProfileService;

    @GetMapping
    public ApiResponse<List<MappingProfileResponse>> list(HttpServletRequest request) {
        List<MappingProfileResponse> data = mappingProfileService.listActive();
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }
}
