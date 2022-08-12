package com.example.ChatoBackend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;
import org.springframework.boot.context.properties.ConstructorBinding;

import javax.persistence.*;

@DynamicInsert
@Getter
@Setter
@Entity
@Table(name = "banned_ip")
public class BannedIp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "banned_ip_no")
    private Long BannedIpNo;

    @Column(name = "room_id")
    private Long roomId;

    @Column(length = 20)
    private String ipAddress;

    @Column(length = 35)
    private String userName;

    public BannedIp(Long roomId, String ipAddress, String userName) {
        this.roomId = roomId;
        this.ipAddress = ipAddress;
        this.userName = userName;
    }

    public BannedIp() {};
}
