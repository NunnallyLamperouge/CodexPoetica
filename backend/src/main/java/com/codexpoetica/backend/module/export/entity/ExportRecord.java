package com.codexpoetica.backend.module.export.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "export_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportRecord {

    @Id
    @Column(name = "id", length = 32, nullable = false)
    private String id;

    @Column(name = "work_id", length = 32, nullable = false)
    private String workId;

    @Column(name = "visitor_id", length = 36)
    private String visitorId;

    @Column(name = "export_type", length = 16)
    private String exportType;

    @Column(name = "file_name", length = 128)
    private String fileName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
