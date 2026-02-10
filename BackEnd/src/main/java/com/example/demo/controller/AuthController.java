package com.example.demo.controller;

import com.example.demo.dto.LoginRequestDTO;
import com.example.demo.dto.LoginResponseDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import com.example.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final CategoryService categoryService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequestDTO loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        User userDetails = (User) authentication.getPrincipal();

        return ResponseEntity.ok(LoginResponseDTO.builder()
                .token(jwt)
                .userId(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequestDTO signUpRequest) {
        System.out.println(">>> Register Request: " + signUpRequest.getEmail());

        if (signUpRequest.getEmail() == null || signUpRequest.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("error", "Error: Email cannot be empty!"));
        }

        String email = signUpRequest.getEmail().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            System.out.println(">>> Email already exists (Pre-check): " + email);
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("error", "Error: Email is already in use! (Pre-check)"));
        }

        User user = User.builder()
                .name(signUpRequest.getName())
                .email(email)
                .password(encoder.encode(signUpRequest.getPassword()))
                .build();

        try {
            User savedUser = userRepository.save(user);
            categoryService.initializeDefaultCategories(savedUser);
            System.out.println(">>> User registered successfully: " + email);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "User registered successfully!"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.out.println(">>> Email collision detected (DB Constraint) for: " + email);
            return ResponseEntity.badRequest().body(
                    java.util.Collections.singletonMap("error", "Error: Email is already in use! (DB Constraint)"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(java.util.Collections.singletonMap("error", "Error: " + e.getMessage()));
        }
    }
}
