package com.codexpoetica.backend.module.publication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class PublicationDetailResponse {
    private String shareCode;
    private String title;
    private String language;
    private String sourceCode;
    private Map<String, Object> astSummary;
    private Map<String, Object> poemResult;
    private Map<String, Object> audioConfig;
    private Map<String, Object> visualConfig;
    private String mappingProfileId;
    private Integer allowCodeView;
    private Integer allowDownload;
    private LocalDateTime publishedAt;
}
