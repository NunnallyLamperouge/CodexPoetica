package com.codexpoetica.backend.dto;

import lombok.Data;

@Data
public class WorkResponse {
    private String code;
    private String poem;
    private String audioUrl;
    private String shareId;
}
