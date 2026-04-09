package com.eva.securefiles.service;

import com.eva.securefiles.model.AuditLog;
import com.eva.securefiles.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private static final Logger audit = LoggerFactory.getLogger("AUDIT");

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    private void log(String action, String username, String details, String ip) {
        audit.info("action={} user={} details=\"{}\" ip={}", action, username, details, ip);

        AuditLog entry = new AuditLog();
        entry.setAction(action);
        entry.setUsername(username);
        entry.setDetails(details);
        entry.setIp(ip);
        entry.setCreatedAt(LocalDateTime.now());
        auditLogRepository.save(entry);
    }

    public Page<AuditLog> getAuditLog(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public void loginSuccess(String username, String ip) {
        log("LOGIN_SUCCESS", username, null, ip);
    }

    public void loginFailure(String username, String ip) {
        log("LOGIN_FAILURE", username, null, ip);
    }

    public void logout(String username) {
        log("LOGOUT", username, null, null);
    }

    public void fileUploaded(String username, String fileName, Long fileId) {
        log("FILE_UPLOAD", username, "file=\"" + fileName + "\" id=" + fileId, null);
    }

    public void fileDownloaded(String username, String fileName, Long fileId) {
        log("FILE_DOWNLOAD", username, "file=\"" + fileName + "\" id=" + fileId, null);
    }

    public void filePreviewed(String username, String fileName, Long fileId) {
        log("FILE_PREVIEW", username, "file=\"" + fileName + "\" id=" + fileId, null);
    }

    public void fileDeleted(String username, String fileName, Long fileId) {
        log("FILE_DELETE", username, "file=\"" + fileName + "\" id=" + fileId, null);
    }

    public void uploadRejected(String username, String fileName, String reason) {
        log("UPLOAD_REJECTED", username, "file=\"" + fileName + "\" reason=\"" + reason + "\"", null);
    }

    public void accessDenied(String username, String path, String ip) {
        log("ACCESS_DENIED", username, "path=" + path, ip);
    }

    public void invalidToken(String reason, String ip) {
        log("INVALID_TOKEN", null, "reason=" + reason, ip);
    }

    public void revokedToken(String username, String ip) {
        log("REVOKED_TOKEN", username, null, ip);
    }

    public void userCreated(String adminUsername, String newUsername, String role) {
        log("USER_CREATED", adminUsername, "newUser=" + newUsername + " role=" + role, null);
    }

    public void userDeleted(String adminUsername, String deletedUsername, Long userId) {
        log("USER_DELETED", adminUsername, "deletedUser=" + deletedUsername + " id=" + userId, null);
    }

    public void userCreationFailed(String adminUsername, String newUsername, String reason) {
        log("USER_CREATION_FAILED", adminUsername, "newUser=" + newUsername + " reason=\"" + reason + "\"", null);
    }
}
