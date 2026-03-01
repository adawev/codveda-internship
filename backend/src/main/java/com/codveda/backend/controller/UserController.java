package com.codveda.backend.controller;

import com.codveda.backend.controller.dto.user.UserCreateRequest;
import com.codveda.backend.controller.dto.user.UserResponse;
import com.codveda.backend.controller.dto.user.AdminUserUpdateRequest;
import com.codveda.backend.controller.dto.user.UserSelfUpdateRequest;
import com.codveda.backend.exception.UnauthorizedException;
import com.codveda.backend.model.User;
import com.codveda.backend.response.ApiResponse;
import com.codveda.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created", toResponse(userService.save(user))));
    }

    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllUsers(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ApiResponse.success(userService.findAll(pageable).map(this::toResponse));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser() {
        return ApiResponse.success(toResponse(resolveCurrentUser()));
    }

    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.success(toResponse(userService.findByIdOrThrow(id)));
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateCurrentUser(@Valid @RequestBody UserSelfUpdateRequest request) {
        if (request.hasForbiddenRoleField()) {
            throw new AccessDeniedException("Role change is not allowed in self update");
        }
        User current = resolveCurrentUser();
        applySelfUpdates(current, request);
        return ApiResponse.success("Profile updated", toResponse(userService.save(current)));
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        User existing = userService.findByIdOrThrow(id);
        applyAdminUpdates(existing, request);
        return ApiResponse.success("User updated", toResponse(userService.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
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

    private void applySelfUpdates(User target, UserSelfUpdateRequest request) {
        applyCommonUpdates(target, request.getName(), request.getEmail(), request.getPassword());
    }

    private void applyAdminUpdates(User target, AdminUserUpdateRequest request) {
        applyCommonUpdates(target, request.getName(), request.getEmail(), request.getPassword());
        if (request.getRole() != null) {
            target.setRole(request.getRole());
        }
    }

    private void applyCommonUpdates(User target, String name, String email, String password) {
        if (name != null) {
            target.setName(name);
        }
        if (email != null) {
            target.setEmail(email);
        }
        if (password != null && !password.isBlank()) {
            target.setPassword(password);
        }
    }
}
