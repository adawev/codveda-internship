package com.codveda.backend.service.auth;

import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.model.auth.RefreshToken;
import com.codveda.backend.repository.RefreshTokenRepository;
import com.codveda.backend.security.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtService jwtService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public String issueToken(UserDetails userDetails, User user) {
        String tokenId = UUID.randomUUID().toString();
        String token = jwtService.generateRefreshToken(userDetails, tokenId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hash(token));
        refreshToken.setExpiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(token).toInstant(), ZoneId.systemDefault()));
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    @Transactional
    public String rotateToken(String currentToken, User user) {
        RefreshToken existing = validateStoredToken(currentToken, user);

        String tokenId = UUID.randomUUID().toString();
        String newToken = jwtService.generateRefreshToken(user, tokenId);
        String newTokenHash = hash(newToken);

        existing.setRevokedAt(LocalDateTime.now());
        existing.setReplacedByTokenHash(newTokenHash);
        existing.setRevokeReason("ROTATED");
        refreshTokenRepository.save(existing);

        RefreshToken replacement = new RefreshToken();
        replacement.setUser(user);
        replacement.setTokenHash(newTokenHash);
        replacement.setExpiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(newToken).toInstant(), ZoneId.systemDefault()));
        refreshTokenRepository.save(replacement);
        return newToken;
    }

    @Transactional
    public void revokeByRawTokenIfPresent(String token, String reason) {
        if (token == null || token.isBlank()) {
            return;
        }
        Optional<RefreshToken> stored = refreshTokenRepository.findByTokenHash(hash(token));
        stored.filter(entry -> !entry.isRevoked())
                .ifPresent(entry -> {
                    entry.setRevokedAt(LocalDateTime.now());
                    entry.setRevokeReason(reason);
                    refreshTokenRepository.save(entry);
                });
    }

    @Transactional
    public void revokeAllActiveForUser(User user, String reason) {
        List<RefreshToken> active = refreshTokenRepository.findAllByUserAndRevokedAtIsNull(user);
        LocalDateTime now = LocalDateTime.now();
        active.forEach(token -> {
            token.setRevokedAt(now);
            token.setRevokeReason(reason);
        });
        refreshTokenRepository.saveAll(active);
    }

    @Transactional(readOnly = true)
    public void assertUsable(String token, User user) {
        validateStoredToken(token, user);
    }

    private RefreshToken validateStoredToken(String token, User user) {
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(token))
                .orElseThrow(() -> new UnauthorizedException("Refresh token not recognized"));
        if (!stored.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Refresh token does not belong to this user");
        }
        if (stored.isRevoked()) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }
        if (stored.isExpired()) {
            throw new UnauthorizedException("Refresh token expired");
        }
        return stored;
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }
}
