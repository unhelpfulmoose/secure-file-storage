package com.eva.securefiles.controller;

import com.eva.securefiles.model.AppUser;
import com.eva.securefiles.service.AuditService;
import com.eva.securefiles.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final AuditService auditService;

    public UserController(UserService userService, AuditService auditService) {
        this.userService = userService;
        this.auditService = auditService;
    }

    record CreateUserRequest(String username, String password, String role) {}

    @GetMapping
    public ResponseEntity<List<AppUser>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping
    public ResponseEntity<AppUser> createUser(@RequestBody CreateUserRequest request,
                                              Authentication authentication) {
        try {
            AppUser created = userService.createUser(request.username(), request.password(), request.role());
            auditService.userCreated(authentication.getName(), created.getUsername(), created.getRole());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            auditService.userCreationFailed(authentication.getName(), request.username(), e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, Authentication authentication) {
        AppUser user = userService.getUserById(id);
        userService.deleteUser(id);
        auditService.userDeleted(authentication.getName(), user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
