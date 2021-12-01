# MultiJSnake :snake::snake::snake:

[![Tests](https://github.com/surt91/multiJSnake/actions/workflows/maven.yml/badge.svg)](https://github.com/surt91/multiJSnake/actions/workflows/maven.yml)

Snake played on a server -- communication happens mostly via Websockets.
Play it on [multijsnake.herokuapp.com](https://multijsnake.herokuapp.com/).
Either alone, with friends (via an invite link) or against computer players.

![Multiple snakes playing against each other](img/multisnake.gif)

It also offers a static stand-alone mode to watch different neural net based autopilots at
[snake.schawe.me](https://snake.schawe.me). Yes, the neural nets are executed in your browser.

![A neural net trained on 50000 games](img/snake.gif)

## :gear: Setup

You just need Java 11 to be installed on your system, other dependencies (Maven, NPM, ...)
will be fetched by the build script. So just run

```bash
./mvnw spring-boot:run
```

And the server will be compiled and started on `http://localhost:8080`.

## :robot: Training an autopilot

You can train a neural net to play the game with the scripts in [`src/main/py`](/tree/main/src/main/py).
As prerequisites there must be Python 3.6+ available and the dependencies from `requirements.txt` need
to be installed, e.g., with `pip install -r requirements.txt`.

Also ensure that the java classes are are compiled (e.g. by executing the above step,)
since the training will need them. More information about this curiosity can be found
at [blog.codecentric.de/2021/11/java-klassen-python](https://blog.codecentric.de/2021/11/java-klassen-python/).

The training can be started and continued by changing into `src/main/py/` and executing the
`train_AC.py` and `train_convAC.py` scripts.

For converting the file with the trained model into a format suitable for `tensorflowjs` use:

```bash
cp yourModelFile.keras strippedModelFile.keras
# remove some data unecessary for inference (but important for training)
python3 strippedModelFile.keras
tensorflowjs_converter --input_format=keras strippedModelFile.keras tfjs_model
```

## :test_tube: Tests

There are unit tests of the backend and end-to-end tests using cypress. You can run them via

```bash
./mvnw test
npm run cy
```

## :hammer_and_wrench: Deployment

Here are some options of how to deploy this server.

### Local (for development and testing)

Thanks to SpringBoot, this can be accomplished simply by executing

```bash
./mvnw spring-boot:run
```

No database setup is required (it is using an in-memory database).

### Static

We can build a static version, which does not include any features needing
the Java-Server, which can be deployed on any web space (e.g. GitHub pages or Netlify).

Just execute

```bash
bash buildStatic.sh
```

and copy the generated folder `tmp/resources/static` to the web, or serve it locally with

```bash
cd tmp/resources/static
python3 -m http.server 8080
```

Note that this does only include the AI demo and not the actual playable multiplayer game.

### On Heroku

Heroku will automatically use the correct build pack to start and execute the server.
However for data persistency a Postgres database has to be created and the following
environment variables should be set:

```bash
# Do not store the native libraries for all platforms, but only the relevant platform (otherwise the artifact is too large for Heroku)
MAVEN_CUSTOM_OPTS=-DskipTests=true -Djavacpp.platform=linux-x86_64
# configure the Postgres DB, these variables are all that is needed to switch from H2 to Postgres
# placeholders for secret values are marked here with []
SPRING_DATASOURCE_DRIVER-CLASS-NAME=org.postgresql.Driver
SPRING_DATASOURCE_PASSWORD=[password]
SPRING_DATASOURCE_TYPE=org.apache.tomcat.jdbc.pool.DataSource
SPRING_DATASOURCE_URL=jdbc:postgresql://[server]:[port]/[database]?sslmode=require
SPRING_DATASOURCE_USERNAME=[user]
SPRING_JPA_DATABASE-PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_HIBERNATE_DDL-AUTO=update
```

### With Docker/docker-compose

There is also a `Dockerfile` in this repository, which builds and executes the server on port 8080.
This is used in the `docker-compose.yml`, which uses `nginx` as a reverse proxy and
`letsencrypt` to serve over https.

To use it, ensure that the following environment variables needed for `letsencrypt`
are set (it also works if they are saved in the file `.env`.)

```bash
DOMAIN=[domain]
EMAIL=[email]
```

Then the containers can be built and started with:

```bash
docker-compose build
docker-compose up
```
