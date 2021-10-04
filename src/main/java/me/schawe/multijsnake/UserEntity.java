package me.schawe.multijsnake;

import javax.persistence.*;

// adapted from https://github.com/springbootbuch/security/blob/master/src/main/java/de/springbootbuch/security/UserEntity.java
@Entity
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String username;

    private String hashedPassword;

    public String getUsername() {
        // here we could add logic for banning users
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }
}