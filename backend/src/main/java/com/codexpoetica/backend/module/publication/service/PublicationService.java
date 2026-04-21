package com.codexpoetica.backend.module.publication.service;

import com.codexpoetica.backend.common.exception.BizException;
import com.codexpoetica.backend.module.publication.dto.PublicationDetailResponse;
import com.codexpoetica.backend.module.publication.dto.ShareRequest;
import com.codexpoetica.backend.module.publication.dto.ShareResponse;
import com.codexpoetica.backend.module.publication.entity.WorkPublication;
import com.codexpoetica.backend.module.publication.repository.WorkPublicationRepository;
import com.codexpoetica.backend.module.work.entity.Work;
import com.codexpoetica.backend.module.work.repository.WorkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicationService {

    private final WorkPublicationRepository publicationRepository;
    private final WorkRepository workRepository;

    @Transactional
    public ShareResponse publish(String visitorId, String workId, ShareRequest req) {
        Work work = workRepository.findByIdAndVisitorId(workId, visitorId)
                .orElseThrow(() -> new BizException(4003, "work not found"));
        if (work.getIsDeleted() == 1) throw new BizException(4003, "work not found");

        // deactivate existing publication
        publicationRepository.findByWorkIdAndStatus(workId, 1).ifPresent(p -> {
            p.setStatus(0);
            publicationRepository.save(p);
        });

        String shareCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String pubId = "pub_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        WorkPublication pub = WorkPublication.builder()
                .id(pubId)
                .workId(workId)
                .shareCode(shareCode)
                .titleSnapshot(work.getTitle())
                .languageSnapshot(work.getLanguage())
                .sourceCodeSnapshot(work.getSourceCode())
                .astSummarySnapshot(work.getAstSummary())
                .poemResultSnapshot(work.getPoemResult())
                .audioConfigSnapshot(work.getAudioConfig())
                .visualConfigSnapshot(work.getVisualConfig())
                .mappingProfileIdSnapshot(work.getMappingProfileId())
                .allowCodeView(req.getAllowCodeView() != null ? req.getAllowCodeView() : 1)
                .allowDownload(req.getAllowDownload() != null ? req.getAllowDownload() : 1)
                .expiredAt(req.getExpiredAt())
                .build();
        publicationRepository.save(pub);

        work.setStatus("published");
        workRepository.save(work);

        return ShareResponse.builder()
                .shareCode(shareCode)
                .shareUrl("/shares/" + shareCode)
                .publishedAt(pub.getPublishedAt())
                .expiredAt(pub.getExpiredAt())
                .build();
    }

    public PublicationDetailResponse getByShareCode(String shareCode) {
        WorkPublication pub = publicationRepository.findByShareCode(shareCode)
                .orElseThrow(() -> new BizException(4004, "share not found"));
        if (pub.getStatus() == 0) throw new BizException(4004, "share not found or expired");
        if (pub.getExpiredAt() != null && pub.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new BizException(4004, "share link expired");
        }
        return PublicationDetailResponse.builder()
                .shareCode(pub.getShareCode())
                .title(pub.getTitleSnapshot())
                .language(pub.getLanguageSnapshot())
                .sourceCode(pub.getAllowCodeView() == 1 ? pub.getSourceCodeSnapshot() : null)
                .astSummary(pub.getAstSummarySnapshot())
                .poemResult(pub.getPoemResultSnapshot())
                .audioConfig(pub.getAudioConfigSnapshot())
                .visualConfig(pub.getVisualConfigSnapshot())
                .mappingProfileId(pub.getMappingProfileIdSnapshot())
                .allowCodeView(pub.getAllowCodeView())
                .allowDownload(pub.getAllowDownload())
                .publishedAt(pub.getPublishedAt())
                .build();
    }
}
