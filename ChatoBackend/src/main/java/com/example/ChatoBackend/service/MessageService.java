package com.example.ChatoBackend.service;

import com.example.ChatoBackend.DTO.MessageDTO;

import java.io.IOException;
import java.util.List;

public interface MessageService {

    public long saveMessage(MessageDTO messageDTO);

    public List<MessageDTO> getMessages(Long roomId, Integer offset);

    public void deleteMessage(Long roomId, Long msgNo);

    public void deleteRoom(Long roomId);

    public void savePicture(byte[] imageBytes, Long roomId, Long msgNo) throws IOException;
}
