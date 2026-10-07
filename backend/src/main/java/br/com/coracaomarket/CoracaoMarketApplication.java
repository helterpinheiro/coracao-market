package br.com.coracaomarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(
        exclude = UserDetailsServiceAutoConfiguration.class
)
public class CoracaoMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                CoracaoMarketApplication.class,
                args
        );
    }
}