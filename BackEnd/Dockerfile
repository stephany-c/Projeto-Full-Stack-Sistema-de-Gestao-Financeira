# Estágio de Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copia o pom.xml e as dependências primeiro para aproveitar o cache do Docker
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o código fonte e gera o jar
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio de Execução
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia apenas o JAR gerado do estágio anterior
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta que o Spring Boot usa
EXPOSE 8080

# Comando para rodar a aplicação
# Váriaveis de ambiente podem ser passadas para sobrescrever o application.properties
ENTRYPOINT ["java", "-jar", "app.jar"]
