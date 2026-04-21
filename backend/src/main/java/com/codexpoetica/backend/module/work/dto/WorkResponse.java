package com.codexpoetica.backend.module.work.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class WorkResponse {
    private String id;
    private String visitorId;
    private String title;
    private String language;
    private String sourceCode;
    private String mappingProfileId;
    private Map<String, Object> astSummary;
    private Map<String, Object> poemResult;
    private Map<String, Object> audioConfig;
    private Map<String, Object> visualConfig;
    private String status;
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
