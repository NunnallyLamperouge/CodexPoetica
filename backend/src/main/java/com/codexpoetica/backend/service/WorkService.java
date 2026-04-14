package com.codexpoetica.backend.service;

import com.codexpoetica.backend.dto.SaveWorkRequest;
import com.codexpoetica.backend.dto.WorkResponse;
import com.codexpoetica.backend.entity.Work;
import com.codexpoetica.backend.repository.WorkRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class WorkService {

    private final WorkRepository workRepository;

    public WorkService(WorkRepository workRepository) {
        this.workRepository = workRepository;
    }

    public String saveWork(SaveWorkRequest request) {
        // 生成shareId（如果没有提供）
        String shareId = request.getShareId();
        if (shareId == null || shareId.isEmpty()) {
            shareId = generateShareId();
        }

        // 创建作品实体
        Work work = new Work();
        work.setCode(request.getCode());
        work.setPoem(request.getPoem());
        work.setAudioUrl(request.getAudioUrl());
        work.setShareId(shareId);

        // 保存作品
        workRepository.save(work);

        return shareId;
    }

    public WorkResponse getWork(String shareId) {
        Optional<Work> workOptional = workRepository.findByShareId(shareId);
        if (workOptional.isEmpty()) {
            throw new RuntimeException("Work not found");
        }

        Work work = workOptional.get();
        WorkResponse response = new WorkResponse();
        response.setCode(work.getCode());
        response.setPoem(work.getPoem());
        response.setAudioUrl(work.getAudioUrl());
        response.setShareId(work.getShareId());

        return response;
    }

    public Page<WorkResponse> getWorks(Pageable pageable) {
        Page<Work> works = workRepository.findAll(pageable);
        return works.map(work -> {
            WorkResponse response = new WorkResponse();
            response.setCode(work.getCode());
            response.setPoem(work.getPoem());
            response.setAudioUrl(work.getAudioUrl());
            response.setShareId(work.getShareId());
            return response;
        });
    }

    public void deleteWork(String shareId) {
        Optional<Work> workOptional = workRepository.findByShareId(shareId);
        if (workOptional.isPresent()) {
            workRepository.delete(workOptional.get());
        }
    }

    private String generateShareId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }
}
