package com.example.ChatoBackend.entity;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRoom {
    private String roomName;
    private String roomId;
    private Integer limit;
    private String subject;
    private boolean isPwRequired;
    private String password;
    private String owner;
}
