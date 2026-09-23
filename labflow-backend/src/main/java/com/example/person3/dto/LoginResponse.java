package com.example.person3.dto;

public class LoginResponse {

    private String token;
    private String role;
    private UserResponse user;


    public LoginResponse(
            String token,
            String role,
            UserResponse user
    ) {
        this.token = token;
        this.role = role;
        this.user = user;
    }


    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public UserResponse getUser() {
        return user;
    }
}