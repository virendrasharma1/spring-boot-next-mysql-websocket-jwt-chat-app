package com.spring.chatserver.dto;

import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessagesDto {
    private Long sentBy;
    private Long sentTo;
    private String message;
    private Long messageId;
    private String status;
}
