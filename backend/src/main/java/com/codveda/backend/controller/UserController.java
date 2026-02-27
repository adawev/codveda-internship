package com.codveda.backend.controller;

import com.codveda.backend.controller.dto.user.UserCreateRequest;
import com.codveda.backend.controller.dto.user.UserResponse;
import com.codveda.backend.controller.dto.user.UserUpdateRequest;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(userService.save(user)));
    }

    @GetMapping
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userService.findAll(pageable).map(this::toResponse);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        return toResponse(resolveCurrentUser());
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable Long id) {
        return toResponse(userService.findByIdOrThrow(id));
    }

    @PutMapping("/me")
    public UserResponse updateCurrentUser(@Valid @RequestBody UserUpdateRequest request) {
        User current = resolveCurrentUser();
        applyUpdates(current, request);
        return toResponse(userService.save(current));
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest request) {
        User existing = userService.findByIdOrThrow(id);
        applyUpdates(existing, request);
        return toResponse(userService.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    private User resolveCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return userService.findByEmailOrThrow(authentication.getName());
    }

    private void applyUpdates(User target, UserUpdateRequest request) {
        if (request.getName() != null) {
            target.setName(request.getName());
        }
        if (request.getEmail() != null) {
            target.setEmail(request.getEmail());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            target.setPassword(request.getPassword());
        }
        if (request.getRole() != null) {
            target.setRole(request.getRole());
        }
    }
}
