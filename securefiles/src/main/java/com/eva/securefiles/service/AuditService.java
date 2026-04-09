package com.eva.securefiles.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger audit = LoggerFactory.getLogger("AUDIT");

    public void loginSuccess(String username, String ip) {
        audit.info("action=LOGIN_SUCCESS user={} ip={}", username, ip);
    }

    public void loginFailure(String username, String ip) {
        audit.warn("action=LOGIN_FAILURE user={} ip={}", username, ip);
    }

    public void logout(String username) {
        audit.info("action=LOGOUT user={}", username);
    }

    public void fileUploaded(String username, String fileName, Long fileId) {
        audit.info("action=FILE_UPLOAD user={} file=\"{}\" id={}", username, fileName, fileId);
    }

    public void fileDownloaded(String username, String fileName, Long fileId) {
        audit.info("action=FILE_DOWNLOAD user={} file=\"{}\" id={}", username, fileName, fileId);
    }

    public void filePreviewed(String username, String fileName, Long fileId) {
        audit.info("action=FILE_PREVIEW user={} file=\"{}\" id={}", username, fileName, fileId);
    }

    public void fileDeleted(String username, String fileName, Long fileId) {
        audit.warn("action=FILE_DELETE user={} file=\"{}\" id={}", username, fileName, fileId);
    }

    public void uploadRejected(String username, String fileName, String reason) {
        audit.warn("action=UPLOAD_REJECTED user={} file=\"{}\" reason=\"{}\"", username, fileName, reason);
    }

    public void accessDenied(String username, String path, String ip) {
        audit.warn("action=ACCESS_DENIED user={} path={} ip={}", username, path, ip);
    }

    public void invalidToken(String ip) {
        audit.warn("action=INVALID_TOKEN ip={}", ip);
    }

    public void revokedToken(String username, String ip) {
        audit.warn("action=REVOKED_TOKEN user={} ip={}", username, ip);
    }

    public void userCreated(String adminUsername, String newUsername, String role) {
        audit.info("action=USER_CREATED admin={} newUser={} role={}", adminUsername, newUsername, role);
    }

    public void userDeleted(String adminUsername, String deletedUsername, Long userId) {
        audit.warn("action=USER_DELETED admin={} deletedUser={} id={}", adminUsername, deletedUsername, userId);
    }

    public void userCreationFailed(String adminUsername, String newUsername, String reason) {
        audit.warn("action=USER_CREATION_FAILED admin={} newUser=\"{}\" reason=\"{}\"", adminUsername, newUsername, reason);
    }
}
