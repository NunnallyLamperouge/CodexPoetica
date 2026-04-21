package com.codexpoetica.backend.module.mapping.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class MappingProfileResponse {
    private String id;
    private String name;
    private String poemStyle;
    private String musicStyle;
    private String visualTheme;
    private Map<String, Object> ruleConfig;
}
