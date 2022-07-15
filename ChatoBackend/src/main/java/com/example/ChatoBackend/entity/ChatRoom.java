package com.example.ChatoBackend.entity;


import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import javax.persistence.*;

@DynamicInsert
@Getter
@Setter
@Entity
@Table(name = "chat_room")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(length = 50, nullable = false)
    private String roomName;

    @Column(length = 2, columnDefinition = "Integer default 0")
    private Integer nowParticipants;

    @Column(length = 2, nullable = false)
    private Integer limitation;

    @Column(length = 20, nullable = false)
    private String subject;

    @Column(nullable = false)
    private boolean pwRequired;

    @Column(length = 20)
    private String password;

    @Column(length = 20)
    private String owner;
}
