package me.schawe.multijsnake;

import me.schawe.multijsnake.usermanagement.AuthEntryPointJwt;
import me.schawe.multijsnake.usermanagement.AuthTokenFilter;
import me.schawe.multijsnake.usermanagement.UserDetailsServiceImpl;
import me.schawe.multijsnake.usermanagement.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.ArrayList;

// roughly following https://www.bezkoder.com/spring-boot-security-postgresql-jwt-authentication/

@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;

    WebSecurityConfig(
            UserDetailsServiceImpl userDetailsService,
            AuthEntryPointJwt unauthorizedHandler
    ) {
        this.userDetailsService = userDetailsService;
        this.unauthorizedHandler = unauthorizedHandler;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeRequests()
                    .antMatchers("/api/auth/**", "/app.css", "/favicon.ico", "/built/**", "/dynamic/**", "/api/init/**", "/").permitAll()
                    .anyRequest().authenticated();

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public UserDetailsService userDetailsService(
            final UserRepository userRepository
    ) {
        return username -> userRepository
                .findOneByUsername(username)
                .map(entity -> new User(
                        entity.getUsername(),
                        entity.getHashedPassword(),
                        // TODO: roles
                        new ArrayList<>()
                ))
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Override
    public void configure(AuthenticationManagerBuilder authenticationManagerBuilder) throws Exception {
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}