package me.schawe.multijsnake;

import me.schawe.multijsnake.highscore.Highscore;
import me.schawe.multijsnake.highscore.HighscoreRepository;
import me.schawe.multijsnake.usermanagement.UserDetailsImpl;
import me.schawe.multijsnake.usermanagement.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserInfoController {
    final UserRepository userRepository;
    final HighscoreRepository highscoreRepository;

    public UserInfoController(UserRepository userRepository, HighscoreRepository highscoreRepository) {
        this.userRepository = userRepository;
        this.highscoreRepository = highscoreRepository;
    }

    @GetMapping("/profile")
    UserDetailsImpl profile(@AuthenticationPrincipal UserDetailsImpl user) {
        return user;
    }

    @GetMapping("/highscore")
    List<Highscore> personalHighscores(@AuthenticationPrincipal UserDetailsImpl user) {
        System.out.println(highscoreRepository.findTop10ByPlayerNameOrderByScoreDesc(user.getUsername()).toString());
        return highscoreRepository.findTop10ByPlayerNameOrderByScoreDesc(user.getUsername());
    }
}
