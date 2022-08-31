package com.example.ChatoBackend.repository;

import com.example.ChatoBackend.DTO.MessageDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Repository
public class MessageRepository {

    private final int OFFSET_STANDARD = 10;

    @Autowired
    private DataSource dataSource;

    SimpleJdbcInsert simpleJdbcInsert;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public void createDynamicTable(Long roomId) throws SQLException {
        /* Connection con = dataSource.getConnection();
        Statement sm = con.createStatement(); */
        String tableName = "room_" + roomId.toString();
        String query = "CREATE TABLE " + tableName +
                " (" +
                "msg_id int NOT NULL AUTO_INCREMENT, " +
                "writer VARCHAR(35) NOT NULL, " +
                "writer_no int, " +
                "message VARCHAR(100) NOT NULL, " +
                "time CHAR(5) NOT NULL, " +
                "is_deleted TINYINT(1) NOT NULL DEFAULT 0, " +
                "is_picture TINYINT(1) NOT NULL DEFAULT 0, " +
                "PRIMARY KEY (msg_id) " +
                ");";
        /* sm.executeUpdate(query);
        con.close(); */
        this.jdbcTemplate.execute(query);
    }

    public long saveMessage(MessageDTO messageDTO) throws SQLException {
        String tableName = "room_" + messageDTO.getRoomId();
        simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
                .withTableName(tableName).usingGeneratedKeyColumns("msg_id");
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("writer", messageDTO.getWriter());
        parameters.put("writer_no", messageDTO.getWriterNo());
        parameters.put("message", messageDTO.getMessage());
        parameters.put("time", messageDTO.getTime());
        parameters.put("is_deleted", false);
        parameters.put("is_picture", messageDTO.getIsPicture());
        Long newId = simpleJdbcInsert.executeAndReturnKey(parameters).longValue();
        return newId;
    }

    public List<MessageDTO> getMessages(Long roomId, Integer offset) throws SQLException {
        String tableName = "room_" + roomId;
        String query = "select * from " + tableName + " order by msg_id desc limit 10 offset " + offset * OFFSET_STANDARD + ";";
        // select * from room_1 order by msg_id desc limit 3 offset 0; limit 읽을갯수 offset 읽을위치.
        Connection con = dataSource.getConnection();
        Statement sm = con.createStatement();
        ResultSet rs = sm.executeQuery(query);
        List<MessageDTO> messageDTOList = new ArrayList<>();
        while (rs.next()) {
            Long msgNo = Long.valueOf(rs.getInt(1));
            String writer = rs.getString(2);
            Long writerNo = rs.getLong(3);
            String message = rs.getString(4);
            String time = rs.getString(5);
            boolean isDeleted = rs.getBoolean(6);
            boolean isPicture = rs.getBoolean(7);
            messageDTOList.add(
                    new MessageDTO(
                            msgNo,
                            null,
                            writer,
                            writerNo,
                            message,
                            time,
                            isDeleted,
                            isPicture));
        }
        con.close();
        return messageDTOList;
    }

    public void deleteMessage(Long roomId, Long msgNo) throws SQLException {
        /* Connection con = dataSource.getConnection();
        Statement sm = con.createStatement(); */
        String tableName = "room_" + roomId;
        String query = "update " + tableName + " set is_deleted = true where msg_id = " + msgNo + ";";
        jdbcTemplate.execute(query);
        /* if (sm.executeUpdate(query) != 1) throw new SQLException();
        con.close(); */
    }

    public void deleteRoom(Long roomId) throws SQLException {
        /* Connection con = dataSource.getConnection();
        Statement sm = con.createStatement(); */
        String tableName = "room_" + roomId;
        String query = "drop table " + tableName + ";";
        jdbcTemplate.execute(query);
        /* sm.executeUpdate(query);
        con.close(); */
    }
}

