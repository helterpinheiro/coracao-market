package br.com.coracaomarket.auth.infrastructure;

import br.com.coracaomarket.user.domain.User;
import br.com.coracaomarket.user.infrastructure.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;


@Component 
public class JwtAuthenticationFilter extends OncePerRequestFilter{
    
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
        JwtService jwtService,
        UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override 
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String authotizationHeader = 
            request.getHeader("Authorization");
        
        if (authotizationHeader == null
            || !authotizationHeader.startsWith("Bearer ")
        ) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authotizationHeader.substring(7);

        if (!jwtService.isValid(token)) {
            filterChain.doFilter(request, response);
            return;   
        }

        var userId = jwtService.extractUserId(token);

        User user = userRepository
            .findById(userId)
            .filter(User::isActive)
            .orElse(null);

        if (user == null) {
            filterChain.doFilter(request, response);
            return;
        }

        var authorities = List.of(
            new SimpleGrantedAuthority(
                "ROLE_" + user.getRole().name()
            )
        );

        var authentication = 
            new UsernamePasswordAuthenticationToken(user, null, authorities);
        
        SecurityContextHolder
            .getContext()
            .setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }   

}
