package com.codexpoetica.backend.service;

import com.codexpoetica.backend.dto.AuthResponse;
import com.codexpoetica.backend.dto.LoginRequest;
import com.codexpoetica.backend.dto.RegisterRequest;
import com.codexpoetica.backend.entity.User;
import com.codexpoetica.backend.repository.UserRepository;
import com.codexpoetica.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        // 检查邮箱是否已存在
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        // 创建新用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // 保存用户
        userRepository.save(user);

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getEmail());

        // 返回响应
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // 根据邮箱查找用户
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        // 验证密码
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 生成JWT令牌
        String token = jwtUtil.generateToken(user.getEmail());

        // 返回响应
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail());
    }
}
