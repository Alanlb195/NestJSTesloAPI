<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">Teslo Shop - Ecommerce API</h1>

<p align="center">
  A robust REST API for ecommerce operations built with NestJS, TypeORM, and PostgreSQL
</p>

## Features

- RESTful API design

<!-- - JWT Authentication -->

- Product management (CRUD)
- Product image handling
- Database seeding
- Dockerized PostgreSQL database
- Environment configuration
- Data validation

## Quick Start

### Prerequisites

- Node.js (18 or later recommended)
- Yarn or npm
- Docker (for database)
- Postman or similar API client (for testing)

### 1. Clone the repository

```bash
git clone https://github.com/Alanlb195/NestJSTesloAPI.git
cd NestJSTesloAPI
```

2. Install dependencies

```
yarn install
```

or

```
npm install
```

### 3. Environment Configuration

Copy the .env.template file and rename it to .env:

```
cp .env.template .env
```

No modifications required for development environment.

### 4. Start the database

```
docker-compose up -d
```

### 5. Run the application

#### Development mode

```
yarn start:dev
```

#### Production build

```
yarn build
yarn start:prod
```

### 6. Seed the database

Send a GET request to:

```
GET http://localhost:3000/api/seed
```
#### Tech Stack
- Framework: NestJS
- Database: PostgreSQL
- ORM: TypeORM
- Containerization: Docker
- Package Manager: Yarn

