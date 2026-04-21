package com.codexpoetica.backend.module.work.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "works")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Work {

    @Id
    @Column(name = "id", length = 32, nullable = false)
    private String id;

    @Column(name = "visitor_id", length = 36, nullable = false)
    private String visitorId;

    @Column(name = "title", length = 128)
    private String title;

    @Column(name = "language", length = 16)
    private String language;

    @Column(name = "source_code", columnDefinition = "mediumtext")
    private String sourceCode;

    @Column(name = "mapping_profile_id", length = 32)
    private String mappingProfileId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ast_summary", columnDefinition = "json")
    private Map<String, Object> astSummary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "poem_result", columnDefinition = "json")
    private Map<String, Object> poemResult;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "audio_config", columnDefinition = "json")
    private Map<String, Object> audioConfig;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "visual_config", columnDefinition = "json")
    private Map<String, Object> visualConfig;

    @Column(name = "status", length = 16)
    private String status;

    @Column(name = "visibility", length = 16)
    private String visibility;

    @Column(name = "is_deleted", nullable = false)
    private Integer isDeleted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.isDeleted == null) this.isDeleted = 0;
        if (this.status == null) this.status = "draft";
        if (this.visibility == null) this.visibility = "private";
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
