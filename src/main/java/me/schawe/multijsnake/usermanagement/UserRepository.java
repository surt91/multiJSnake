package me.schawe.multijsnake.usermanagement;

import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends Repository<User, Integer> {
    void save(User user);

    Optional<User> findOneByUsername(String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    List<User> findAll();
}