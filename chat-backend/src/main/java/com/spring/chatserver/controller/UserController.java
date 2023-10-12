package com.spring.chatserver.controller;


import com.spring.chatserver.dto.CurrentUser;
import com.spring.chatserver.dto.UserDto;
import com.spring.chatserver.exception.BadRequestException;
import com.spring.chatserver.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/")
public class UserController {

    UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("")
    public ResponseEntity<UserDto> getUserDetails(@CurrentUser UserDto user) {
        return ResponseEntity.ok().body(user);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> findUsersByNameOrName(@RequestParam String searchString) {
        return ResponseEntity.ok().body(userService.findUsersByNameOrName(searchString));
    }

    @PutMapping("")
    public ResponseEntity<UserDto> updateUserDetails(@CurrentUser UserDto loggedInUser, @RequestBody UserDto user) throws Exception {
        if (!loggedInUser.getUserId().equals(user.getUserId())) {
            throw new BadRequestException("Not Authorized");
        }
        UserDto updatedUser = userService.updateUserDetails(user);
        return ResponseEntity.ok().body(updatedUser);
    }
}
