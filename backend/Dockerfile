
# Stage 1: Build ReleaseLens backend using Java 25
FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /app

# Copy Maven configuration
COPY backend/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy backend source
COPY backend/src ./src

# Compile, test and package
RUN mvn clean package -B

# Stage 2: Run ReleaseLens
FROM eclipse-temurin:25-jre

WORKDIR /app/backend

# Copy compiled Spring Boot application
COPY --from=build /app/target/evidence-engine-0.1.0.jar app.jar

# Copy mutation testing evidence
COPY evidence/pr17 /app/evidence/pr17

# Expose Spring Boot port
EXPOSE 8080

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]
