package me.schawe.multijsnake.frontend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
public class SingleSiteAppController {
    @RequestMapping(value={"/", "/profile", "/ai"}, method = RequestMethod.GET)
    public String root() {
        return "forward:/index.html";
    }
}
