package com.codexpoetica.backend.module.mapping.service;

import com.codexpoetica.backend.module.mapping.dto.MappingProfileResponse;
import com.codexpoetica.backend.module.mapping.repository.MappingProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MappingProfileService {

    private final MappingProfileRepository mappingProfileRepository;

    public List<MappingProfileResponse> listActive() {
        return mappingProfileRepository.findByStatus(1).stream()
                .map(p -> MappingProfileResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .poemStyle(p.getPoemStyle())
                        .musicStyle(p.getMusicStyle())
                        .visualTheme(p.getVisualTheme())
                        .ruleConfig(p.getRuleConfig())
                        .build())
                .collect(Collectors.toList());
    }
}
