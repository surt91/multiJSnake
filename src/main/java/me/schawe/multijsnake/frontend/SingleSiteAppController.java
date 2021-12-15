package me.schawe.multijsnake.frontend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SingleSiteAppController {
    @GetMapping({"/", "/profile", "/ai"})
    public String root() {
        return "main";
    }
}
