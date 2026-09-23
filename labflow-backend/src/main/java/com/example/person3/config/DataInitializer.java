package com.example.person3.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Value("${admin.id}")
    private String adminId;

    @Override
    public void run(String... args) {

        System.out.println(
                "LabAutomation started successfully."
        );

        System.out.println(
                "Configured Admin ID: " + adminId
        );
    }
}