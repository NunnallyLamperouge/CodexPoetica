package com.codexpoetica.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/parse")
public class ParseController {

    @PostMapping("/python")
    public ResponseEntity<Map<String, Object>> parsePython(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        
        // 这里应该实现Python代码的AST解析
        // 由于Java中解析Python代码需要使用特殊库或调用外部Python进程
        // 这里提供一个示例实现，实际项目中需要根据具体情况选择合适的解析方式
        
        Map<String, Object> ast = new HashMap<>();
        ast.put("type", "Module");
        ast.put("body", new Object[0]);
        ast.put("code", code);
        
        Map<String, Object> response = new HashMap<>();
        response.put("ast", ast);
        
        return ResponseEntity.ok(response);
    }
}
