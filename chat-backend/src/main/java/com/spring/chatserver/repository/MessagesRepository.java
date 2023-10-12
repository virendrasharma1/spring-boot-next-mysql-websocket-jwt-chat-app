package com.spring.chatserver.repository;

import com.spring.chatserver.model.Messages;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<Messages, String> {

    @Query(value = "SELECT " +
            "    CASE " +
            "        WHEN m.sent_to = ?1 THEN m.sent_by " +
            "        ELSE m.sent_to " +
            "    END AS user_id, " +
            "    MAX(m.message_id) AS latest_message_id, " +
            "    u.name AS user_name, " +
            "    (SELECT message FROM messages WHERE message_id = MAX(m.message_id) LIMIT 1) AS message, " +
            "     (SELECT status FROM messages WHERE message_id = MAX(m.message_id) LIMIT 1) AS status " +
            "FROM " +
            "    messages m " +
            "JOIN " +
            "    users u ON (m.sent_to = u.user_id OR m.sent_by = u.user_id) " +
            "WHERE " +
            "    (m.sent_to = ?1 OR m.sent_by = ?1)" +
            "    AND u.user_id != ?1 " +
            "GROUP BY " +
            "    CASE " +
            "        WHEN m.sent_to = ?1 THEN m.sent_by" +
            "        ELSE m.sent_to" +
            "    END," +
            "    u.name " +
            "ORDER BY " +
            "    latest_message_id",
            nativeQuery = true)
    Page<Object[]> getUserDistinctMessages(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT m  FROM Messages m WHERE (m.sentBy.id = :loggedInUserId AND m.sentTo.id = :chatRecipientId) OR (m.sentBy.id = :chatRecipientId AND m.sentTo.id = :loggedInUserId) ORDER BY m.id DESC")
    List<Messages> getUserMessagesWithUser(@Param("loggedInUserId") Long loggedInUserId, @Param("chatRecipientId") Long chatRecipientId, Pageable paginationObject);
}
