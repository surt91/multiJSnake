package me.schawe.multijsnake.usermanagement;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    final AuthenticationManager authenticationManager;

    final UserRepository userRepository;

//    @Autowired
//    RoleRepository roleRepository;

    final PasswordEncoder encoder;

    final JwtUtils jwtUtils;

    AuthController(UserDetailsServiceImpl userDetailsService, AuthenticationManager authenticationManager, UserRepository userRepository, PasswordEncoder encoder, JwtUtils jwtUtils){
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    private JwtResponse jwtFromUserAndPasswort(String username, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles);
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(jwtFromUserAndPasswort(loginRequest.getUsername(), loginRequest.getPassword()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        Map<String, String> errors = new HashMap<>();

        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            errors.put("username", "Username is already taken!");
        }

        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            errors.put("email", "Email is already registered!");
        }

        if (errors.size() == 0) {

            // Create new user's account
            User user = new User(
                    registrationRequest.getUsername(),
                    registrationRequest.getEmail(),
                    encoder.encode(registrationRequest.getPassword())
            );

            userRepository.save(user);

            return ResponseEntity.ok(jwtFromUserAndPasswort(registrationRequest.getUsername(), registrationRequest.getPassword()));
        } else {
            return ResponseEntity.badRequest().body(errors);
        }
    }
}
