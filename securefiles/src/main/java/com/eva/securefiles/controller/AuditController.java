package com.eva.securefiles.controller;

import com.eva.securefiles.model.AuditLog;
import com.eva.securefiles.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAuditLog(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        page = Math.max(0, page);
        size = Math.min(size, 100);
        return ResponseEntity.ok(auditService.getAuditLog(PageRequest.of(page, size)));
    }
}
