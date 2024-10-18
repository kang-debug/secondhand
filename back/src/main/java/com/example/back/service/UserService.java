package com.example.back.service;

import com.example.back.dto.UserDto;
import com.example.back.entity.Member;
import com.example.back.repository.MemberRepository;
import com.example.back.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class UserService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // 이메일 형식과 비밀번호 조건에 대한 정규식
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{6,}$");

    public String authenticateUser(String email, String password) {
        Member member = memberRepository.findByEmail(email);
        if (member == null || !passwordEncoder.matches(password, member.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        return jwtUtil.generateToken(email);
    }

    public UserDto registerUser(String email, String nickname, String password) {
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new IllegalArgumentException("비밀번호는 최소 6자리 이상, 특수문자를 포함해야 합니다.");
        }

        if (memberRepository.findByEmail(email) != null) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        Member member = new Member();
        member.setEmail(email);
        member.setNickname(nickname);
        member.setPassword(passwordEncoder.encode(password));

        member = memberRepository.save(member);

        return new UserDto(member.getMemberId(), member.getEmail(), member.getNickname(), member.getPoints(), member.getJoinDate());
    }

    public UserDto getUserProfile(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return new UserDto(member.getMemberId(), member.getEmail(), member.getNickname(), member.getPoints(), member.getJoinDate());
    }
}
