# See also https://spring.io/guides/gs/spring-boot-docker/

# ensure that the `jar` file is up-to-date: `./mvnw package`
# maybe test with `java -jar target/RESTfulSnake-0.0.1-SNAPSHOT.jar`
# ensure that docker is running `sudo systemctl start docker`
# then build with `docker build -t surt91/restfulsnake .`
# then run the image with `docker run -p 8080:8080 surt91/restfulsnake`

FROM openjdk:11
RUN addgroup spring && adduser spring --ingroup spring --gecos "" --disabled-password
USER spring:spring
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
