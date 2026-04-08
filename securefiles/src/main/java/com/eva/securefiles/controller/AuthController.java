package com.eva.securefiles.controller;

import com.eva.securefiles.config.LoginRateLimiter;
import com.eva.securefiles.service.AuditService;
import com.eva.securefiles.service.JwtService;
import com.eva.securefiles.service.TokenDenylistService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenDenylistService tokenDenylistService;
    private final AuditService auditService;
    private final LoginRateLimiter rateLimiter;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtService jwtService,
                          UserDetailsService userDetailsService,
                          TokenDenylistService tokenDenylistService,
                          AuditService auditService,
                          LoginRateLimiter rateLimiter) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenDenylistService = tokenDenylistService;
        this.auditService = auditService;
        this.rateLimiter = rateLimiter;
    }

    record LoginRequest(String username, String password) {}
    record LoginResponse(String token, String username, String role) {}

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();

        if (rateLimiter.isBlocked(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).build();
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password())
            );
        } catch (BadCredentialsException e) {
            rateLimiter.recordFailure(ip);
            auditService.loginFailure(request.username(), ip);
            throw e;
        }

        rateLimiter.reset(ip);
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        String token = jwtService.generateToken(userDetails);
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .orElse("USER");

        auditService.loginSuccess(request.username(), ip);
        return ResponseEntity.ok(new LoginResponse(token, request.username(), role));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String authHeader) {
        if (!authHeader.startsWith("Bearer ")) {
            return ResponseEntity.noContent().build();
        }
        String token = authHeader.substring(7);
        try {
            String username = jwtService.extractUsername(token);
            String jti = jwtService.extractJti(token);
            long ttl = jwtService.getRemainingValiditySeconds(token);
            tokenDenylistService.denyToken(jti, ttl);
            auditService.logout(username);
        } catch (JwtException e) {
            // Token is already invalid — nothing to revoke
        }
        return ResponseEntity.noContent().build();
    }
}
