package me.schawe.multijsnake;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MultiJSnakeApplication {

	public static void main(String[] args) {
		SpringApplication.run(MultiJSnakeApplication.class, args);
	}

}
