package com.codexpoetica.backend.module.visitor.service;

import com.codexpoetica.backend.module.visitor.entity.VisitorProfile;
import com.codexpoetica.backend.module.visitor.repository.VisitorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisitorService {

    private final VisitorProfileRepository visitorProfileRepository;

    public void upsert(String visitorId) {
        visitorProfileRepository.findById(visitorId).ifPresentOrElse(
                v -> {
                    v.setLastSeenAt(LocalDateTime.now());
                    visitorProfileRepository.save(v);
                },
                () -> visitorProfileRepository.save(VisitorProfile.builder()
                        .visitorId(visitorId)
                        .firstSeenAt(LocalDateTime.now())
                        .lastSeenAt(LocalDateTime.now())
                        .status(1)
                        .build())
        );
    }
}
