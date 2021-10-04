package me.schawe.multijsnake;

import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// https://www.javadevjournal.com/spring-security/registration-with-spring-security/
@Service()
public class UserService {

    private final UserRepository userRepository;
    PasswordEncoder passwordEncoder;

    UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public void register(UserData user) throws UserAlreadyExistException {
        if(checkIfUserExist(user.getUsername())){
            throw new UserAlreadyExistException("User already exists for this name");
        }
        UserEntity userEntity = new UserEntity();
        // here we are copying fields from one object to an object of a different class
        BeanUtils.copyProperties(user, userEntity);
        encodePassword(userEntity, user);
        userRepository.save(userEntity);
    }

    public boolean checkIfUserExist(String username) {
        return userRepository.findOneByUsername(username).isPresent();
    }

    private void encodePassword(UserEntity userEntity, UserData user){
        userEntity.setHashedPassword(passwordEncoder.encode(user.getPassword()));
    }
}
