package com.codexpoetica.backend.module.mapping.repository;

import com.codexpoetica.backend.module.mapping.entity.MappingProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MappingProfileRepository extends JpaRepository<MappingProfile, String> {

    List<MappingProfile> findByStatus(Integer status);
}
