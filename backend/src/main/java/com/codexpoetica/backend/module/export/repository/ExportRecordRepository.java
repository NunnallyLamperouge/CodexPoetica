package com.codexpoetica.backend.module.export.repository;

import com.codexpoetica.backend.module.export.entity.ExportRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportRecordRepository extends JpaRepository<ExportRecord, String> {
}
