package com.example.back.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserDto {
    private Long memberId;  // memberId 필드 추가
    private String email;
    private String nickname;
    private Long balance;
    private LocalDateTime createdAt;

    public UserDto(Long memberId, String email, String nickname, Long balance, LocalDateTime createdAt) {
        this.memberId = memberId;
        this.email = email;
        this.nickname = nickname;
        this.balance = balance;
        this.createdAt = createdAt;
    }
}
