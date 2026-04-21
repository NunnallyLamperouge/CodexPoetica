package com.codexpoetica.backend.common.util;

import jakarta.servlet.http.HttpServletRequest;

public final class TraceIdUtil {

    private static final String TRACE_ID_ATTR = "traceId";

    private TraceIdUtil() {}

    public static String getTraceId(HttpServletRequest request) {
        Object traceId = request.getAttribute(TRACE_ID_ATTR);
        return traceId != null ? traceId.toString() : "";
    }

    public static void setTraceId(HttpServletRequest request, String traceId) {
        request.setAttribute(TRACE_ID_ATTR, traceId);
    }
}
