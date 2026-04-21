package com.codexpoetica.backend.module.parse.dto;

import lombok.Data;

@Data
public class ParseRequest {
    private String language;
    private String sourceCode;
}
