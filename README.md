# FinançaX - Sistema de Gestão Financeira Personalizada 💰🚀

O **FinançaX** é uma solução Full Stack moderna e robusta para controle de finanças pessoais. Desenvolvida com **Java (Spring Boot)** e **Angular**, a aplicação oferece uma experiência de usuário premium com foco em performance, segurança e design responsivo.

![FinançaX Preview](https://img.shields.io/badge/Status-Concluído-green?style=for-the-badge)
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

---

## 🛠️ Tecnologias Utilizadas

Este projeto é dividido em duas partes principais: um frontend construído com **Angular 19** e um backend com **Spring Boot 3.4**.

| Componente       | Tecnologia          | Versão   |
| :--------------- | :------------------ | :------- |
| **Frontend**     | Angular             | 19.x     |
|                  | TypeScript          | 5.x      |
|                  | SCSS (Sass)         | -        |
|                  | Chart.js            | 4.x      |
|                  | Node.js             | 18+      |
| **Backend**      | Java                | 17 LTS   |
|                  | Spring Boot         | 3.4.1    |
|                  | Spring Security     | 6.x      |
|                  | Maven               | 3.8+     |
|                  | Swagger (OpenAPI)   | 2.3.0    |
| **Banco de Dados**| PostgreSQL         | 15+      |

---

## ✨ Funcionalidades Principais

- **📊 Dashboard Interativo**: Visualização gráfica (Rosca e Barras) de receitas e despesas.
- **📝 Gestão de Transações**: CRUD completo com filtragem por data, tipo e categoria.
- **⚡ Edição Inline**: Atualize valores e descrições diretamente na listagem sem abrir modais.
- **🏷️ Categorias Inteligentes**: Sistema híbrido de categorias globais e personalizadas.
- **🔐 Autenticação JWT**: Login seguro com tokens e interceptors no frontend.
- **📱 UX/UI Premium**: Design Glassmorphism, responsivo e com feedback visual imediato (Toasts).

---

## 🚀 Instalação e Execução

Você pode rodar o projeto de duas formas: via **Docker** (recomendado pela praticidade) ou **Manualmente**.

### Opção 1: Utilizando Docker 🐳
*Pré-requisitos: Git, Docker e Docker Compose.*

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/stephany-c/Projeto-Full-Stack-Sistema-de-Gestao-Financeira.git
   cd Projeto-Full-Stack-Sistema-de-Gestao-Financeira
   ```

2. **Subir os containers**
   ```bash
   docker-compose up --build
   ```

3. **Acessar a aplicação**
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - Backend API: [http://localhost:8080](http://localhost:8080)
   - Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

> **Nota**: Para parar a aplicação, pressione `Ctrl + C` e execute `docker-compose down`.

---

### Opção 2: Instalação Manual 🛠️
*Pré-requisitos: JDK 17, Maven 3.8+, Node.js 18+, PostgreSQL.*

#### 1. Configuração do Banco de Dados
Certifique-se de ter uma instância do PostgreSQL rodando na porta `5432`.
Crie o banco de dados:
```sql
CREATE DATABASE financeira;
```
*Se necessário, ajuste as credenciais em `BackEnd/src/main/resources/application.properties`.*

#### 2. Executar o Backend
No terminal, navegue até a pasta do backend:
```bash
cd BackEnd
mvn clean install
mvn spring-boot:run
```

#### 3. Executar o Frontend
Em outro terminal, navegue até a pasta do frontend:
```bash
cd FrontEnd
npm install
ng serve
```

A aplicação estará disponível em [http://localhost:4200](http://localhost:4200).

---

## 📚 Documentação da API (Swagger)

A API possui documentação interativa via Swagger UI.
Acesse: **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**

---

## 📁 Estrutura do Repositório

- `/BackEnd`: API Restful com Spring Boot.
- `/FrontEnd`: SPA com Angular.
- `docker-compose.yml`: Orquestração dos serviços.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
*Desenvolvido por Stephany C.*
