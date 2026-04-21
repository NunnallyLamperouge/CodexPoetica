package com.codexpoetica.backend.module.visitor.repository;

import com.codexpoetica.backend.module.visitor.entity.VisitorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitorProfileRepository extends JpaRepository<VisitorProfile, String> {
}
