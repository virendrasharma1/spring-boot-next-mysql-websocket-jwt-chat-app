package com.spring.chatserver.repository;

import com.spring.chatserver.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {

    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);

    @Query("SELECT c FROM User c WHERE c.name LIKE %:searchString% OR c.username LIKE %:searchString%")
    List<User> findUsersByNameOrName(@Param("searchString") String searchString);
}
