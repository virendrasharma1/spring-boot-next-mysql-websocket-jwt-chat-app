package com.spring.chatserver.controller;


import com.spring.chatserver.dto.*;
import com.spring.chatserver.service.MessagesService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/message")
public class MessagesController {

    private final MessagesService messagesService;

    public MessagesController(MessagesService messagesService) {
        this.messagesService = messagesService;
    }

    @GetMapping("/{pageNumber}/{pageSize}")
    public ResponseEntity<List<MessageSummaryDto>> getUserMessages(@CurrentUser UserDto user, @PathVariable("pageNumber") Integer pageNumber, @PathVariable("pageSize") Integer pageSize) {
        return ResponseEntity.ok().body(messagesService.getUserMessages(user.getUserId(), pageNumber, pageSize));
    }

    @GetMapping("{chatRecipientId}/{pageNumber}/{pageSize}")
    public ResponseEntity<List<MessagesDto>> getUserMessagesWithUser(@CurrentUser UserDto user, @PathVariable("chatRecipientId") Long chatRecipientId, @PathVariable("pageNumber") Integer pageNumber, @PathVariable("pageSize") Integer pageSize) {
        return ResponseEntity.ok().body(messagesService.getUserMessagesWithUser(user.getUserId(), chatRecipientId, pageNumber, pageSize));
    }

    @PostMapping("")
    public ResponseEntity<MessagesDto> postMessage(@CurrentUser UserDto loggedInUser, @RequestBody MessagesDto messagesDto) {
        MessagesDto savedMessagesDto = messagesService.postMessage(loggedInUser, messagesDto);
        return ResponseEntity.ok().body(savedMessagesDto);
    }

    @PutMapping("/read")
    public void markMessagesReadForUsers(@CurrentUser UserDto user, @RequestBody UpdateMessageStatusDto updateMessageStatusDto) {
        messagesService.markMessagesReadForUsers(user.getUserId(), updateMessageStatusDto);
    }

}
