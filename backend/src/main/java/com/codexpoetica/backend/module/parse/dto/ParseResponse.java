package com.codexpoetica.backend.module.parse.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ParseResponse {
    private int nodeCount;
    private int maxDepth;
    private int functionCount;
    private int variableCount;
    private int branchCount;
}
