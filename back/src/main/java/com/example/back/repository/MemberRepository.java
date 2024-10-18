package com.example.back.repository;

import com.example.back.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;


public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByEmail(String email);
}