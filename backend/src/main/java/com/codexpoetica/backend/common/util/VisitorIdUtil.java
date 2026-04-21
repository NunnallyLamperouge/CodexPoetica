package com.codexpoetica.backend.common.util;

import com.codexpoetica.backend.common.exception.BizException;
import jakarta.servlet.http.HttpServletRequest;

public final class VisitorIdUtil {

    private VisitorIdUtil() {}

    public static String getRequiredVisitorId(HttpServletRequest request) {
        String visitorId = request.getHeader("X-Visitor-Id");
        if (visitorId == null || visitorId.isBlank()) {
            throw new BizException(4000, "missing X-Visitor-Id");
        }
        return visitorId;
    }

    public static String getOptionalVisitorId(HttpServletRequest request) {
        return request.getHeader("X-Visitor-Id");
    }
}
