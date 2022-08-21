package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.DTO.MessageDTO;
import com.example.ChatoBackend.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.subject = :newSubject where cr.roomId = :roomId")
    void changeSubject(Long roomId, String newSubject);

    Optional<ChatRoom> findByRoomId(Long roomId);

    @Transactional
    @Modifying
    void deleteByRoomId(Long rooId);

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.nowParticipants = cr.nowParticipants + 1 where cr.roomId = :roomId")
    void increaseParticipantsCount(Long roomId);

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.nowParticipants = cr.nowParticipants - 1 where cr.roomId = :roomId")
    void decreaseParticipantsCount(Long roomId);

    List<ChatRoom> findByRoomNameContaining(String keyword);

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.pwRequired = true, cr.password = :password where cr.roomId = :roomId")
    void turnOnPwRequiredByRoomId(String password, Long roomId);

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.pwRequired = false, cr.password = null where cr.roomId = :roomId")
    void turnOffPwRequiredByRoomId(Long roomId);

    @Query("select cr.nowParticipants from ChatRoom cr where cr.roomId = :roomId")
    int getRoomLimitationByRoomId(Long roomId);

    @Transactional
    @Modifying
    @Query("update ChatRoom cr set cr.limitation = :limitation where cr.roomId = :roomId")
    void updateRoomLimitationByRoomId(int limitation, long roomId);
}
