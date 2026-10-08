package br.com.coracaomarket.auth.application;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.coracaomarket.auth.api.AuthResponse;
import br.com.coracaomarket.auth.api.LoginRequest;
import br.com.coracaomarket.auth.api.RegisterRequest;
import br.com.coracaomarket.auth.infrastructure.JwtService;
import br.com.coracaomarket.user.domain.User;
import br.com.coracaomarket.user.domain.UserRole;
import br.com.coracaomarket.user.infrastructure.UserRepository;

@Service 
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException(
                "Email is already registered"
            );
        }

         String normalizedEmail =
            request.email().trim().toLowerCase();

        String encodedPassword =
            passwordEncoder.encode(request.password());

        User user = new User(
            request.name().trim(),
            normalizedEmail,
            encodedPassword,
            UserRole.CUSTOMER
        );

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String normalizedEmail =
                request.email().trim().toLowerCase();

        User user = userRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(InvalidCredentialsException::new);

        if (!user.isActive()
                || !passwordEncoder.matches(
                        request.password(),
                        user.getPassword()
                )) {

            throw new InvalidCredentialsException();
        }
        String token = jwtService.generateToken(user);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token
        );
    }

}
