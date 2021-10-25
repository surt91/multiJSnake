package me.schawe.multijsnake;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

// TODO: I would like a catchall, but I do ot know how
@Controller
public class SingleSiteAppController {
    @RequestMapping(value="/profile", method = RequestMethod.GET)
    public String profile() {
        return "forward:/index.html";
    }

    @RequestMapping(value="/ai", method = RequestMethod.GET)
    public String ai() {
        return "forward:/index.html";
    }
}
