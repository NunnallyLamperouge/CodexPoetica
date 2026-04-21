package com.codexpoetica.backend.module.work.repository;

import com.codexpoetica.backend.module.work.entity.Work;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkRepository extends JpaRepository<Work, String> {

    Optional<Work> findByIdAndVisitorId(String id, String visitorId);

    List<Work> findByVisitorIdAndIsDeletedOrderByCreatedAtDesc(String visitorId, Integer isDeleted);
}
