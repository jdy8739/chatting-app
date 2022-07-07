package com.example.ChatoBackend.entrance_limit_handler;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class EntranceLimitHandler {

    private Map<Integer, ArrayList<Integer>> entranceLimitMap = new HashMap<>();

    public boolean checkIfEntranceAvailable(Integer roomId) {
        List<Integer> targetList = entranceLimitMap.get(roomId);
        Integer numberOfParticipants = targetList.get(0);
        if (numberOfParticipants + 1 <= targetList.get(1)) {
            targetList.set(0, numberOfParticipants + 1);
            return true;
        } else {
            return false;
        }
    }

    public void reduceNumberOfParticipants(Integer roomId) {
        List<Integer> targetList = entranceLimitMap.get(roomId);
        targetList.set(0, targetList.get(0) - 1);
    }
}
