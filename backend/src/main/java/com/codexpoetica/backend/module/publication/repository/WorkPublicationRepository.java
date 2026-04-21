package com.codexpoetica.backend.module.publication.repository;

import com.codexpoetica.backend.module.publication.entity.WorkPublication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkPublicationRepository extends JpaRepository<WorkPublication, String> {

    Optional<WorkPublication> findByShareCode(String shareCode);

    Optional<WorkPublication> findByWorkIdAndStatus(String workId, Integer status);
}
