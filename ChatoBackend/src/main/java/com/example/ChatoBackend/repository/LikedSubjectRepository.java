package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.LikedSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface LikedSubjectRepository extends JpaRepository<LikedSubject, Long> {

    @Transactional
    @Modifying
    @Query("delete from LikedSubject ls where ls.userNo = :userNo and ls.subject = :subject")
    void deleteLikedSubjectByUserNo(Long userNo, String subject);

    @Query("select ls from LikedSubject ls where ls.userNo = :userNo")
    List<LikedSubject> findLikedListByUserNo(Long userNo);

    @Query("select count(ls) from LikedSubject ls WHERE ls.userNo = :userNo")
    int getLikedSubjectCountPerUser(Long userNo);

    @Transactional
    @Modifying
    @Query(value = "delete from liked_subject where user_no = :userNo limit 1;", nativeQuery = true)
    void deleteTop1ByUserNo(Long userNo);

    @Transactional
    @Modifying
    @Query("delete from LikedSubject ls where ls.userNo = :userNo")
    void deleteByUserNo(Long userNo);
}
