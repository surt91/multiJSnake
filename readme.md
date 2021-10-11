# MultiJSnake

[![Tests](https://github.com/surt91/multiJSnake/actions/workflows/maven.yml/badge.svg)](https://github.com/surt91/multiJSnake/actions/workflows/maven.yml)

Snake played on a server -- communication happens mostly via Websockets.
Play it on [multijsnake.herokuapp.com](https://multijsnake.herokuapp.com/).

## Setup

You need Java 11 with Maven for the backend and `npm` to build the frontend. With these prerequisites the server can 
be built and started on `http://localhost:8080` with:

```
./mvnw spring-boot:run
```

## Tests

There are unit tests of the backend and end-to-end tests using cypress. You can run them via

```
./mvnw test
npm run cy
```
