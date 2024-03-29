# https://stackoverflow.com/a/27768965

# just build with `docker-compose build` in the parent directory

# Build stage
FROM maven:3.8-openjdk-17 AS build
COPY . build/
RUN cd build && mvn -Djavacpp.platform=linux-x86_64 -DskipTests package
RUN rm -rf build/target/node build/target/classes

# Package stage
FROM openjdk:17-slim
RUN adduser --group spring && adduser spring --ingroup spring --gecos "" --disabled-password
USER spring:spring
COPY --from=build ./build/target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]