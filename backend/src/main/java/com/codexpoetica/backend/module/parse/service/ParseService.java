package com.codexpoetica.backend.module.parse.service;

import com.codexpoetica.backend.common.exception.BizException;
import com.codexpoetica.backend.module.parse.dto.ParseRequest;
import com.codexpoetica.backend.module.parse.dto.ParseResponse;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class ParseService {

    private static final Pattern DEF_PATTERN = Pattern.compile("\\bdef\\s+\\w+");
    private static final Pattern ASSIGN_PATTERN = Pattern.compile("^\\s*\\w+\\s*=[^=].*");
    private static final Pattern BRANCH_PATTERN = Pattern.compile("\\b(if|elif|else|for|while|try|except)\\b");

    public ParseResponse parse(ParseRequest req) {
        if (!"python".equalsIgnoreCase(req.getLanguage())) {
            throw new BizException(4001, "unsupported language: " + req.getLanguage());
        }
        String code = req.getSourceCode();
        if (code == null || code.isBlank()) {
            return ParseResponse.builder().build();
        }

        String[] lines = code.split("\\r?\\n");
        int nodeCount = 0;
        int maxDepth = 0;
        int functionCount = 0;
        int variableCount = 0;
        int branchCount = 0;

        for (String line : lines) {
            if (line.isBlank()) continue;
            nodeCount++;

            int depth = getIndentDepth(line);
            if (depth > maxDepth) maxDepth = depth;

            if (DEF_PATTERN.matcher(line).find()) functionCount++;
            if (ASSIGN_PATTERN.matcher(line).find()) variableCount++;
            if (BRANCH_PATTERN.matcher(line).find()) branchCount++;
        }

        return ParseResponse.builder()
                .nodeCount(nodeCount)
                .maxDepth(maxDepth)
                .functionCount(functionCount)
                .variableCount(variableCount)
                .branchCount(branchCount)
                .build();
    }

    private int getIndentDepth(String line) {
        int spaces = 0;
        for (char c : line.toCharArray()) {
            if (c == ' ') spaces++;
            else if (c == '\t') spaces += 4;
            else break;
        }
        return spaces / 4;
    }
}
