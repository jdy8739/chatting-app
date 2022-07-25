package com.example.ChatoBackend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_no")
    private Long userNo;

    @Column(length = 20, nullable = false, unique = true)
    private String id;

    @Column(length = 20, nullable = false)
    private String nickName;

    @Column(length = 100, nullable = false)
    private String password;

    @Column(columnDefinition = "Boolean default false")
    private Boolean isPicRegistered;

    @Column(length = 50)
    private String profilePicUrl;

    public User(String id, String nickName, String password, String url) {
        this.id = id;
        this.nickName = nickName;
        this.password = password;
        this.profilePicUrl = url;
    }
}
