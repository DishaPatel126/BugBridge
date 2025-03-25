# Use an official OpenJDK runtime as a parent image
FROM amazoncorretto:17-al2023-jdk

# Install Node.js and npm
RUN dnf install -y nodejs npm

# Set the working directory in the container
WORKDIR /usr/app

# Copy the compiled JAR file from your target directory into the container
COPY target/*.jar app.jar

# Allow overriding the default port at build time and runtime
ARG PORT=8080
ENV PORT=${PORT}

# Expose the port on which your Spring Boot application will run
EXPOSE ${PORT}

# Run the Spring Boot application and pass the port to the application
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
