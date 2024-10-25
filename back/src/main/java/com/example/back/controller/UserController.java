package com.example.back.controller;

import com.example.back.dto.ChargeRequest;
import com.example.back.dto.LoginRequest;
import com.example.back.dto.RegisterRequest;
import com.example.back.dto.UserDto;
import com.example.back.security.UserPrincipal;
import com.example.back.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody RegisterRequest registerRequest) {
        UserDto createdUser = userService.registerUser(registerRequest.getEmail(), registerRequest.getNickname(), registerRequest.getPassword());
        return ResponseEntity.ok(createdUser);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) {
        String token = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserDto userDto = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(userDto);
    }

    @PostMapping("/charge")
    public ResponseEntity<String> chargeBalance(@RequestBody ChargeRequest chargeRequest, Principal principal) {
        try {
            String email = principal.getName();
            userService.chargeBalance(email, chargeRequest.getAmount());
            return ResponseEntity.ok("충전이 성공적으로 완료되었습니다.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("충전 중 오류가 발생했습니다.");
        }
    }

}
