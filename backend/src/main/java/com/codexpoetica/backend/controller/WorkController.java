package com.codexpoetica.backend.controller;

import com.codexpoetica.backend.dto.SaveWorkRequest;
import com.codexpoetica.backend.dto.WorkResponse;
import com.codexpoetica.backend.service.WorkService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;

    public WorkController(WorkService workService) {
        this.workService = workService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> saveWork(@RequestBody SaveWorkRequest request) {
        String shareId = workService.saveWork(request);
        Map<String, String> response = new HashMap<>();
        response.put("shareId", shareId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{shareId}")
    public ResponseEntity<WorkResponse> getWork(@PathVariable String shareId) {
        WorkResponse response = workService.getWork(shareId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<WorkResponse>> getWorks(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<WorkResponse> works = workService.getWorks(pageable);
        return ResponseEntity.ok(works);
    }

    @DeleteMapping("/{shareId}")
    public ResponseEntity<Void> deleteWork(@PathVariable String shareId) {
        workService.deleteWork(shareId);
        return ResponseEntity.noContent().build();
    }
}
