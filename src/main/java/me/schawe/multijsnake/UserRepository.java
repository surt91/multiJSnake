package me.schawe.multijsnake;

import org.springframework.data.repository.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends Repository<UserEntity, Integer> {
    void save(UserEntity userEntity);

    Optional<UserEntity> findOneByUsername(String login);

    List<UserEntity> findAll();
}