package com.eva.securefiles.config;

import com.eva.securefiles.service.AuditService;
import com.eva.securefiles.service.JwtService;
import com.eva.securefiles.service.TokenDenylistService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenDenylistService tokenDenylistService;
    private final AuditService auditService;

    public JwtAuthFilter(JwtService jwtService,
                         UserDetailsService userDetailsService,
                         TokenDenylistService tokenDenylistService,
                         AuditService auditService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.tokenDenylistService = tokenDenylistService;
        this.auditService = auditService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (ExpiredJwtException e) {
            auditService.invalidToken("expired", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (SignatureException e) {
            auditService.invalidToken("bad signature", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (MalformedJwtException e) {
            auditService.invalidToken("malformed", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (UnsupportedJwtException e) {
            auditService.invalidToken("unsupported", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        } catch (JwtException e) {
            auditService.invalidToken("unknown", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Reject tokens that have been explicitly revoked via logout
            String jti = jwtService.extractJti(token);
            if (tokenDenylistService.isDenied(jti)) {
                auditService.revokedToken(username, request.getRemoteAddr());
                chain.doFilter(request, response);
                return;
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (jwtService.isTokenValid(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        chain.doFilter(request, response);
    }
}
