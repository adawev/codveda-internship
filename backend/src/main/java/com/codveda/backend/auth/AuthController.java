package com.codveda.backend.auth;

import com.codveda.backend.auth.dto.AccessTokenResponse;
import com.codveda.backend.auth.dto.AuthResponse;
import com.codveda.backend.auth.dto.LoginRequest;
import com.codveda.backend.auth.dto.MessageResponse;
import com.codveda.backend.auth.dto.RefreshRequest;
import com.codveda.backend.auth.dto.RegisterRequest;
import com.codveda.backend.model.User;
import com.codveda.backend.model.cart.Cart;
import com.codveda.backend.model.enums.Role;
import com.codveda.backend.repository.CartRepository;
import com.codveda.backend.security.JwtService;
import com.codveda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final CartRepository cartRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            UserService userService,
            CartRepository cartRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userService = userService;
        this.cartRepository = cartRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new MessageResponse("Email already registered"));
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
        String refreshToken = jwtService.generateRefreshToken(user);

        return ResponseEntity.ok(
                new AuthResponse(accessToken, refreshToken, user.getRole().name(), user.getEmail())
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AccessTokenResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        String refreshToken = request.getRefreshToken();
        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String tokenType;
        try {
            tokenType = jwtService.extractTokenType(refreshToken);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!"refresh".equals(tokenType)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userService.findByEmail(email).orElseThrow();
        if (!jwtService.isTokenValid(refreshToken, user)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = jwtService.generateAccessToken(user);
        return ResponseEntity.ok(new AccessTokenResponse(accessToken));
    }
}
