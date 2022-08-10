package com.example.ChatoBackend.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import javax.persistence.*;

@Getter
@Setter
@Entity
@DynamicInsert
@AllArgsConstructor
@Table(name = "liked_subject")
public class LikedSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "liked_subject_no")
    private Long likedSubjectNo;

    @Column(name = "user_no")
    private Long userNo;

    @Column(length = 20, nullable = false)
    private String subject;

    public LikedSubject() {}

    public LikedSubject (Long userMo, String subject) {
        this.userNo = userMo;
        this.subject = subject;
    }
}
