package com.codexpoetica.backend.module.work.service;

import com.codexpoetica.backend.common.exception.BizException;
import com.codexpoetica.backend.module.visitor.service.VisitorService;
import com.codexpoetica.backend.module.work.dto.WorkListItem;
import com.codexpoetica.backend.module.work.dto.WorkRequest;
import com.codexpoetica.backend.module.work.dto.WorkResponse;
import com.codexpoetica.backend.module.work.entity.Work;
import com.codexpoetica.backend.module.work.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkService {

    private final WorkRepository workRepository;
    private final VisitorService visitorService;

    @Transactional
    public WorkResponse create(String visitorId, WorkRequest req) {
        visitorService.upsert(visitorId);
        String id = "work_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        Work work = Work.builder()
                .id(id)
                .visitorId(visitorId)
                .title(req.getTitle())
                .language(req.getLanguage())
                .sourceCode(req.getSourceCode())
                .mappingProfileId(req.getMappingProfileId())
                .astSummary(req.getAstSummary())
                .poemResult(req.getPoemResult())
                .audioConfig(req.getAudioConfig())
                .visualConfig(req.getVisualConfig())
                .build();
        workRepository.save(work);
        return toResponse(work);
    }

    @Transactional
    public WorkResponse update(String visitorId, String workId, WorkRequest req) {
        Work work = workRepository.findByIdAndVisitorId(workId, visitorId)
                .orElseThrow(() -> new BizException(4003, "work not found"));
        if (work.getIsDeleted() == 1) throw new BizException(4003, "work not found");
        work.setTitle(req.getTitle());
        work.setLanguage(req.getLanguage());
        work.setSourceCode(req.getSourceCode());
        work.setMappingProfileId(req.getMappingProfileId());
        work.setAstSummary(req.getAstSummary());
        work.setPoemResult(req.getPoemResult());
        work.setAudioConfig(req.getAudioConfig());
        work.setVisualConfig(req.getVisualConfig());
        workRepository.save(work);
        return toResponse(work);
    }

    public WorkResponse getById(String visitorId, String workId) {
        Work work = workRepository.findByIdAndVisitorId(workId, visitorId)
                .orElseThrow(() -> new BizException(4003, "work not found"));
        if (work.getIsDeleted() == 1) throw new BizException(4003, "work not found");
        return toResponse(work);
    }

    public List<WorkListItem> listByVisitor(String visitorId) {
        return workRepository.findByVisitorIdAndIsDeletedOrderByCreatedAtDesc(visitorId, 0)
                .stream().map(this::toListItem).collect(Collectors.toList());
    }

    @Transactional
    public void delete(String visitorId, String workId) {
        Work work = workRepository.findByIdAndVisitorId(workId, visitorId)
                .orElseThrow(() -> new BizException(4003, "work not found"));
        work.setIsDeleted(1);
        workRepository.save(work);
    }

    private WorkResponse toResponse(Work w) {
        return WorkResponse.builder()
                .id(w.getId())
                .visitorId(w.getVisitorId())
                .title(w.getTitle())
                .language(w.getLanguage())
                .sourceCode(w.getSourceCode())
                .mappingProfileId(w.getMappingProfileId())
                .astSummary(w.getAstSummary())
                .poemResult(w.getPoemResult())
                .audioConfig(w.getAudioConfig())
                .visualConfig(w.getVisualConfig())
                .status(w.getStatus())
                .visibility(w.getVisibility())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }

    private WorkListItem toListItem(Work w) {
        return WorkListItem.builder()
                .id(w.getId())
                .title(w.getTitle())
                .language(w.getLanguage())
                .status(w.getStatus())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
