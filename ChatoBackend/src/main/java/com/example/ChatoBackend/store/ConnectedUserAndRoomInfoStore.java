package com.example.ChatoBackend.store;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class ConnectedUserAndRoomInfoStore {
    public Map<String, String[]> connectedUserMap = new HashMap<>();
}
