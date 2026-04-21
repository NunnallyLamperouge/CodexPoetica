package com.codexpoetica.backend.module.publication.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShareRequest {
    private Integer allowCodeView;
    private Integer allowDownload;
    private LocalDateTime expiredAt;
}
