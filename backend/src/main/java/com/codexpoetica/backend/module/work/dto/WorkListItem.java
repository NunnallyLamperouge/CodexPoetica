package com.codexpoetica.backend.module.work.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WorkListItem {
    private String id;
    private String title;
    private String language;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
