#----------------------------------
# Stage 1
#----------------------------------

# Import docker image with maven installed
FROM maven:3.8.3-openjdk-17 as builder

# Set working directory
WORKDIR /src

# Copy source code from local to container
COPY . /src

# Build application and skip test cases
RUN mvn clean install -DskipTests=true

#--------------------------------------
# Stage 2
#--------------------------------------

# Import small size java image
FROM openjdk:17-alpine as deployer

# Copy build from stage 1 (builder)
COPY --from=builder /src/target/*.jar /src/target/classic.jar

# Expose application port 
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "/src/target/classic.jar"]
