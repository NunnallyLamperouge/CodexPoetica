package com.codexpoetica.backend.module.mapping.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "mapping_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MappingProfile {

    @Id
    @Column(name = "id", length = 32, nullable = false)
    private String id;

    @Column(name = "name", length = 64, nullable = false)
    private String name;

    @Column(name = "poem_style", length = 32)
    private String poemStyle;

    @Column(name = "music_style", length = 32)
    private String musicStyle;

    @Column(name = "visual_theme", length = 32)
    private String visualTheme;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rule_config", columnDefinition = "json")
    private Map<String, Object> ruleConfig;

    @Column(name = "is_builtin", nullable = false)
    private Integer isBuiltin;

    @Column(name = "status", nullable = false)
    private Integer status;
}
