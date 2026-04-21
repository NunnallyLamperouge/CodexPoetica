package com.codexpoetica.backend.module.visitor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitorProfile {

    @Id
    @Column(name = "visitor_id", length = 36, nullable = false)
    private String visitorId;

    @Column(name = "visitor_token", length = 64)
    private String visitorToken;

    @Column(name = "first_seen_at", nullable = false)
    private LocalDateTime firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @Column(name = "status", nullable = false)
    private Integer status;
}
