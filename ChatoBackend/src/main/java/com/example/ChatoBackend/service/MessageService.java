package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.MessageDTO;

import java.util.List;

public interface MessageService {

    public long saveMessage(MessageDTO messageDTO);

    public List<MessageDTO> getMessages(Long roomId, String password, Integer offset);

    public void deleteMessage(Long roomId, Long msgNo);

    public void deleteRoom(Long roomId);
}
