package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.BannedIp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BannedIpRepository extends JpaRepository<BannedIp, Long> {

    @Query("select bi.ipAddress from BannedIp bi where bi.roomId = :roomId")
    List<String> findIpAddressByRoomId(long roomId);

    @Query("select bi from BannedIp bi where bi.roomId = :roomId")
    List<BannedIp> findBannedIpByRoomId(long roomId);

    @Transactional
    @Modifying
    @Query("delete from BannedIp bi where bi.BannedIpNo = :BannedIpNo")
    void deleteBannedIpByBannedIpNo(long BannedIpNo);
}
