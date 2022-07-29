package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("select u from User u where u.id = :id")
    Optional<User> findById(String id);

    @Transactional
    @Modifying
    @Query("delete from User u where u.id = :id")
    void deleteById(String id);

}
