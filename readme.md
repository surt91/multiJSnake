# RestfulSnake

Snake played on a server -- communication happens mostly via Websockets.
Play it on [multijsnake.herokuapp.com](https://multijsnake.herokuapp.com/).

## Setup

You need Java 11 and Maven, then the server can be build and started on `http://localhost:8080` with

```
./mvnw spring-boot:run
```

## TODO:

* User management via Spring Boot security
  * Load and Save states
* AI Snakes trained via Reinforcement learning
  * train with Keras and load model with DL4J? 
* proper URL snake.schawe.me ?
* write Tests
  * unit tests
  * cypress e2e/integration tests
* polish the UI

### Bugs:

* we do not have to reconnect the whole websocket, it should be enough to unsubscribe
  from one subscription and resubscribe to the new one
* I need to adapt the exception handler such that they are propagated over the websocket
  (e.g., if the id does not exist)
* I need to stop the game once all humans disconnected