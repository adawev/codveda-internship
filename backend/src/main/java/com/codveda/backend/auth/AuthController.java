package com.codveda.backend.auth;

import com.codveda.backend.auth.dto.AccessTokenResponse;
import com.codveda.backend.auth.dto.AuthResponse;
import com.codveda.backend.auth.dto.LoginRequest;
import com.codveda.backend.auth.dto.MessageResponse;
import com.codveda.backend.auth.dto.RegisterRequest;
import com.codveda.backend.exception.ConflictException;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.repository.CartRepository;
import com.codveda.backend.security.JwtService;
import com.codveda.backend.service.auth.RefreshTokenService;
import com.codveda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final CartRepository cartRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final String refreshCookieName;
    private final boolean refreshCookieSecure;
    private final long refreshExpirationMs;

    public AuthController(
            UserService userService,
            CartRepository cartRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            @Value("${app.auth.refresh-cookie-name}") String refreshCookieName,
            @Value("${app.auth.refresh-cookie-secure:true}") boolean refreshCookieSecure,
            @Value("${app.jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.userService = userService;
        this.cartRepository = cartRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.refreshCookieName = refreshCookieName;
        this.refreshCookieSecure = refreshCookieSecure;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(Role.USER);

        User savedUser = userService.save(user);

        Cart cart = new Cart();
        cart.setUser(savedUser);
        savedUser.setCart(cart);
        cartRepository.save(cart);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userService.findByEmail(request.getEmail()).orElseThrow();
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.issueToken(user, user);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshToken).toString())
                .body(new AuthResponse(accessToken, user.getRole().name(), user.getEmail(), user.getId()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken == null) {
            throw new UnauthorizedException("Missing refresh token");
        }
        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String tokenType;
        try {
            tokenType = jwtService.extractTokenType(refreshToken);
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        if (!"refresh".equals(tokenType)) {
            throw new UnauthorizedException("Invalid token type");
        }

        User user = userService.findByEmailOrThrow(email);
        refreshTokenService.assertUsable(refreshToken, user);
        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new UnauthorizedException("Expired or invalid refresh token");
        }

        String rotatedRefreshToken = refreshTokenService.rotateToken(refreshToken, user);
        String accessToken = jwtService.generateAccessToken(user);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(rotatedRefreshToken).toString())
                .body(new AccessTokenResponse(accessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        refreshTokenService.revokeByRawTokenIfPresent(refreshToken, "LOGOUT");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .body(new MessageResponse("Logged out"));
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (refreshCookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from(refreshCookieName, token)
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(refreshCookieName, "")
                .httpOnly(true)
                .secure(refreshCookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(Duration.ZERO)
                .build();
    }
}
