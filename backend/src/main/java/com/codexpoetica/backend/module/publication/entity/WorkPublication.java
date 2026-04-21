package com.codexpoetica.backend.module.publication.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "work_publications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkPublication {

    @Id
    @Column(name = "id", length = 32, nullable = false)
    private String id;

    @Column(name = "work_id", length = 32, nullable = false)
    private String workId;

    @Column(name = "share_code", length = 24, unique = true)
    private String shareCode;

    @Column(name = "title_snapshot", length = 128)
    private String titleSnapshot;

    @Column(name = "language_snapshot", length = 16)
    private String languageSnapshot;

    @Column(name = "source_code_snapshot", columnDefinition = "mediumtext")
    private String sourceCodeSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ast_summary_snapshot", columnDefinition = "json")
    private Map<String, Object> astSummarySnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "poem_result_snapshot", columnDefinition = "json")
    private Map<String, Object> poemResultSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "audio_config_snapshot", columnDefinition = "json")
    private Map<String, Object> audioConfigSnapshot;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "visual_config_snapshot", columnDefinition = "json")
    private Map<String, Object> visualConfigSnapshot;

    @Column(name = "mapping_profile_id_snapshot", length = 32)
    private String mappingProfileIdSnapshot;

    @Column(name = "allow_code_view", nullable = false)
    private Integer allowCodeView;

    @Column(name = "allow_download", nullable = false)
    private Integer allowDownload;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "status", nullable = false)
    private Integer status;

    @PrePersist
    public void prePersist() {
        if (this.allowCodeView == null) this.allowCodeView = 1;
        if (this.allowDownload == null) this.allowDownload = 1;
        if (this.status == null) this.status = 1;
        if (this.publishedAt == null) this.publishedAt = LocalDateTime.now();
    }
}
