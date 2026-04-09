package com.eva.securefiles.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(length = 50)
    private String username;

    @Column(length = 500)
    private String details;

    @Column(length = 50)
    private String ip;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getUsername() { return username; }
    public String getDetails() { return details; }
    public String getIp() { return ip; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setId(Long id) { this.id = id; }
    public void setAction(String action) { this.action = action; }
    public void setUsername(String username) { this.username = username; }
    public void setDetails(String details) { this.details = details; }
    public void setIp(String ip) { this.ip = ip; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
