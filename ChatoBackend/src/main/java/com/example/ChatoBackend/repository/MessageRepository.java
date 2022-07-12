package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.DTO.MessageDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import javax.swing.plaf.nimbus.State;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Repository
public class MessageRepository {

    private final int OFFSET_STANDARD = 10;

    @Autowired
    private DataSource dataSource;

    public int createDynamicTable(Long roomId) throws SQLException {
        Connection con = dataSource.getConnection();
        Statement sm = con.createStatement();
        String tableName = "room_" + roomId.toString();
        String query = "CREATE TABLE " + tableName +
                " (" +
                "msg_id int NOT NULL AUTO_INCREMENT, " +
                "writer VARCHAR(35) NOT NULL, " +
                "message VARCHAR(100) NOT NULL, " +
                "time CHAR(5) NOT NULL, " +
                "is_deleted TINYINT(1) NOT NULL DEFAULT 0, " +
                "PRIMARY KEY (msg_id) " +
                ");";
        return sm.executeUpdate(query);
    }

    public int saveMessage(MessageDTO messageDTO) throws SQLException {
        String tableName = "room_" + messageDTO.getRoomId();
        String query = "insert into " + tableName + " (writer, message, time) values (?, ?, ?)";
        Connection con = dataSource.getConnection();
        PreparedStatement ps = con.prepareStatement(query);
        ps.setString(1, messageDTO.getWriter());
        ps.setString(2, messageDTO.getMessage());
        ps.setString(3, messageDTO.getTime());
        return ps.executeUpdate();
    }

    public List<MessageDTO> getMessages(Long roomId, Integer offset) throws SQLException {
        String tableName = "room_" +roomId;
        String query = "select * from " + tableName + " order by msg_id desc limit 10 offset " + offset * OFFSET_STANDARD + ";";
        // select * from room_1 order by msg_id desc limit 3 offset 0; limit 읽을갯수 offset 읽을위치.
        Connection con = dataSource.getConnection();
        Statement sm = con.createStatement();
        ResultSet rs = sm.executeQuery(query);
        List<MessageDTO> messageDTOList = new ArrayList<>();
        while (rs.next()) {
            Integer msgNo = rs.getInt(1);
            String writer = rs.getString(2);
            String message = rs.getString(3);
            String time = rs.getString(4);
            boolean isDeleted = rs.getBoolean(5);
            messageDTOList.add(new MessageDTO(msgNo.longValue(), null, writer, message, time, isDeleted));
        }
        return messageDTOList;
    }
}

