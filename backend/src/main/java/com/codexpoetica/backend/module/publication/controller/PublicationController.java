package com.codexpoetica.backend.module.publication.controller;

import com.codexpoetica.backend.common.response.ApiResponse;
import com.codexpoetica.backend.common.util.TraceIdUtil;
import com.codexpoetica.backend.common.util.VisitorIdUtil;
import com.codexpoetica.backend.module.publication.dto.PublicationDetailResponse;
import com.codexpoetica.backend.module.publication.dto.ShareRequest;
import com.codexpoetica.backend.module.publication.dto.ShareResponse;
import com.codexpoetica.backend.module.publication.service.PublicationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PublicationController {

    private final PublicationService publicationService;

    @PostMapping("/api/v1/works/{workId}/share")
    public ApiResponse<ShareResponse> share(@PathVariable String workId,
                                            @RequestBody(required = false) ShareRequest req,
                                            HttpServletRequest request) {
        String visitorId = VisitorIdUtil.getRequiredVisitorId(request);
        if (req == null) req = new ShareRequest();
        ShareResponse data = publicationService.publish(visitorId, workId, req);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }

    @GetMapping("/api/v1/shares/{shareCode}")
    public ApiResponse<PublicationDetailResponse> getShare(@PathVariable String shareCode,
                                                           HttpServletRequest request) {
        PublicationDetailResponse data = publicationService.getByShareCode(shareCode);
        return ApiResponse.success(data, TraceIdUtil.getTraceId(request));
    }
}
