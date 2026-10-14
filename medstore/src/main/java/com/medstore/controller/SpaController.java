package com.medstore.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/login", "/medicines", "/billing", "/alerts", "/reports", "/users"})
    public String forward() {
        return "forward:/index.html";
    }
}