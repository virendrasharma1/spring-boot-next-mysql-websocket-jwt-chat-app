package com.spring.chatserver.dto;

import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageSummaryDto {
    private Long userId;
    private Long correspondUserId;
    private Long messageId;
    private String chatRecipientName;
    private String message;
    private String status;
    private Long latestMessageUserId;

}
