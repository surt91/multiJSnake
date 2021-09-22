package me.schawe.RestfulSnake;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RestfulSnakeApplication {

	public static void main(String[] args) {
		SpringApplication.run(RestfulSnakeApplication.class, args);
	}

}
