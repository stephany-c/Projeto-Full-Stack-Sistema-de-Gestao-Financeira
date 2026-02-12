# FinançaX - Sistema de Gestão Financeira Personalizada 💰🚀

O **FinançaX** é uma plataforma moderna e completa para controle de finanças pessoais. Desenvolvida com as tecnologias mais robustas do mercado, a aplicação oferece uma experiência de usuário premium, com foco em design, responsividade e facilidade de uso.

![FinançaX Preview](https://img.shields.io/badge/Status-Concluído-green?style=for-the-badge)
![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Spring Boot](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)

---

## ✨ Funcionalidades Principais

- **📊 Dashboard Interativo**: Resumo visual imediato de saldo, receitas e despesas com gráficos dinâmicos (Chart.js).
- **📝 Gestão de Transações**: Sistema completo de CRUD para entradas e saídas com filtragem inteligente.
- **🏷️ Categorias Personalizáveis**: Os usuários podem criar, editar e excluir suas próprias categorias de gastos.
- **🔐 Autenticação Segura**: Fluxo completo de Login e Cadastro utilizando **JWT (JSON Web Tokens)** e Spring Security.


---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 19+**: Framework SPA.
- **TypeScript**: Tipagem estática para maior segurança.
- **SCSS**: Estilos modulares e responsivos.
- **Chart.js**: Gráficos de alta performance.

### Backend
- **Java 17**: Linguagem LTS.
- **Spring Boot 3.4**: Framework base.
- **Spring Doc (OpenAPI)**: Documentação automática.
- **Spring Security + JWT**: Segurança de nível bancário.
- **PostgreSQL**: Banco de dados relacional.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Usando Docker (Recomendado)

Esta é a forma mais rápida de subir todo o ecossistema (Banco + Back + Front):

1. Clone o repositório:
```bash
git clone https://github.com/stephany-c/Projeto-Full-Stack-Sistema-de-Gestao-Financeira.git
cd Projeto-Full-Stack-Sistema-de-Gestao-Financeira
```

2. Suba os containers:
```bash
docker-compose up --build
```

3. Acesse em seu navegador:
   - **Frontend**: [http://localhost:4200](http://localhost:4200)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)

---

### Execução Manual (Desenvolvimento)

#### BackEnd:
1. Certifique-se de ter um PostgreSQL rodando na porta `5432`.
2. Configure as credenciais no arquivo `BackEnd/src/main/resources/application.properties`.
3. Execute:
   ```bash
   cd BackEnd
   mvn spring-boot:run
   ```

#### FrontEnd:
1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Execute:
   ```bash
   cd FrontEnd
   npm install
npm start
   ```

---

## 📁 Estrutura do Repositório

- `/BackEnd`: Código fonte da API Spring Boot.
- `/FrontEnd`: Código fonte da interface Angular.
- `docker-compose.yml`: Arquivo de orquestração do ambiente.

---

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
*Desenvolvido por Stephany C.*
