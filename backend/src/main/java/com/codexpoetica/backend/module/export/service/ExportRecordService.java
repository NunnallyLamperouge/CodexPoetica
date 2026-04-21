package com.codexpoetica.backend.module.export.service;

import com.codexpoetica.backend.module.export.dto.ExportRequest;
import com.codexpoetica.backend.module.export.entity.ExportRecord;
import com.codexpoetica.backend.module.export.repository.ExportRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExportRecordService {

    private final ExportRecordRepository exportRecordRepository;

    public void record(String visitorId, ExportRequest req) {
        String id = "exp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        exportRecordRepository.save(ExportRecord.builder()
                .id(id)
                .workId(req.getWorkId())
                .visitorId(visitorId)
                .exportType(req.getExportType())
                .fileName(req.getFileName())
                .build());
    }
}
