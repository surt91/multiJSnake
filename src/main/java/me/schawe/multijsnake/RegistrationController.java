package me.schawe.multijsnake;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import javax.validation.Valid;

@Controller
public class RegistrationController {

    private final UserService userService;

    RegistrationController(UserService userService){
        this.userService = userService;
    }

    @GetMapping("/register")
    public String register(final Model model){
        model.addAttribute("userData", new UserData());
        return "/register";
    }

    @PostMapping("/register")
    public String userRegistration(final @Valid UserData userData, final BindingResult bindingResult, final Model model){
        if(bindingResult.hasErrors()){
            model.addAttribute("registrationForm", userData);
            return "/register";
        }
        try {
            userService.register(userData);
        } catch (UserAlreadyExistException e){
            bindingResult.rejectValue("username", "userData.username","An account already exists for this username.");
            model.addAttribute("registrationForm", userData);
            return "/register";
        }
        return "/index";
    }
}