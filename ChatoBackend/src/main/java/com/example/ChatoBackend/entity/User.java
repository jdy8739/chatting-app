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

    @Column(length = 20, nullable = false)
    private String id;

    @Column(length = 20, nullable = false)
    private String nickName;

    @Column(length = 100, nullable = false)
    private String password;

    @Column(columnDefinition = "Boolean default false")
    private Boolean isPicRegistered;

    @Column(columnDefinition = "TEXT(65535)")
    private byte[] userPic;

    public User(String id, String nickName, String password, byte[] bytes) {
        this.id = id;
        this.nickName = nickName;
        this.password = password;
        this.userPic = bytes;
    }
}
