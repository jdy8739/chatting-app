package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
