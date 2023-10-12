package com.spring.chatserver.service;

import com.spring.chatserver.dto.UserDto;
import com.spring.chatserver.exception.ResourceNotFoundException;
import com.spring.chatserver.model.User;
import com.spring.chatserver.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;


    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        // Let people login with either username or email
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with username: ", username, username)
                );
    }


    public UserDto updateUserDetails(UserDto userDto) {
        User savedUser = userRepository.findById(String.valueOf(userDto.getUserId()))
                .map(user -> User.builder()
                        .name(userDto.getName())
                        .build())
                .map(userRepository::save)
                .orElseThrow(() -> new ResourceNotFoundException("User", "User details", userDto.getUserId()));

        return UserDto.builder()
                .userId(savedUser.getId())
                .userName(savedUser.getUsername())
                .name(savedUser.getName())
                .build();

    }

    public UserDto getUserDetails(String id) {
        return userRepository.findById(id)
                .map(user -> UserDto.builder()
                        .userName(user.getUsername())
                        .userId(user.getId())
                        .name(user.getName())
                        .build())
                .orElseThrow(() -> new ResourceNotFoundException("User", "User details", id));
    }

    public List<UserDto> findUsersByNameOrName(String name) {
        List<User> users = userRepository.findUsersByNameOrName(name);

        return users.stream().map(user -> UserDto.builder()
                .userName(user.getUsername())
                .userId(user.getId())
                .name(user.getName())
                .build()).toList();
    }
}
