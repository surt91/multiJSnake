package me.schawe.multijsnake;

import me.schawe.multijsnake.snake.PythonEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import py4j.GatewayServer;

@SpringBootApplication
@EnableScheduling
public class MultiJSnakeApplication {

	public static void main(String[] args) {

		SpringApplication.run(MultiJSnakeApplication.class, args);

		// TODO move this into a CommandlineRunner? ALso make it depend on an argument?
		GatewayServer gatewayServer = new GatewayServer(new PythonEntry());
		gatewayServer.start();
		System.out.println("Gateway Server Started");

	}

}
