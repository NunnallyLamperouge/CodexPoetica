package com.codexpoetica.backend.module.export.dto;

import lombok.Data;

@Data
public class ExportRequest {
    private String workId;
    private String exportType;
    private String fileName;
}
