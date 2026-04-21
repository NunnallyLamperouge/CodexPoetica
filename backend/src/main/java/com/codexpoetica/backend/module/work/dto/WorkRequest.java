package com.codexpoetica.backend.module.work.dto;

import lombok.Data;

import java.util.Map;

@Data
public class WorkRequest {
    private String title;
    private String language;
    private String sourceCode;
    private String mappingProfileId;
    private Map<String, Object> astSummary;
    private Map<String, Object> poemResult;
    private Map<String, Object> audioConfig;
    private Map<String, Object> visualConfig;
}
