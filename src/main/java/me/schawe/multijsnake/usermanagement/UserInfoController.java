package me.schawe.multijsnake.usermanagement;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserInfoController {
    final UserRepository userRepository;

    @GetMapping("/profile")
    UserDetailsImpl profile(@AuthenticationPrincipal UserDetailsImpl user) {
        System.out.println(user.toString());
        return user;
    }

    public UserInfoController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
}
