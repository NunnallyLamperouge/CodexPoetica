package com.codexpoetica.backend.module.publication.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShareResponse {
    private String shareCode;
    private String shareUrl;
    private LocalDateTime publishedAt;
    private LocalDateTime expiredAt;
}
