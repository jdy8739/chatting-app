package com.example.ChatoBackend.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MessageDTO {
    private Long msgNo;
    private String roomId;
    private String writer;
    private Long writerNo;
    private String message;
    private String time;
    private Boolean isDeleted;
    private Boolean isPicture;
}
