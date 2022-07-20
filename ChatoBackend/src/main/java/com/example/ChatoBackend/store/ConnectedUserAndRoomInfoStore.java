package com.example.ChatoBackend.store;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Slf4j
@Component
public class ConnectedUserAndRoomInfoStore {
    public Map<String, String[]> connectedUserMap = new HashMap<>();
    public Map<Long, Set<String>> participantsUserMap = new HashMap<>();
}
