package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.BannedIp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannedIpRepository extends JpaRepository<BannedIp, Long> {
}
