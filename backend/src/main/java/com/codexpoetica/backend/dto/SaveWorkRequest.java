package com.codexpoetica.backend.dto;

import lombok.Data;

@Data
public class SaveWorkRequest {
    private String code;
    private String poem;
    private String audioUrl;
    private String shareId;
}
