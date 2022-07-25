package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("select u from User u where u.id = :id")
    Optional<User> findById(String id);

}
