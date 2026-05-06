# Account Shop

A full-stack application for managing shop accounts.

## Project Structure

This repository contains both the frontend client and the backend service:
- `fontend-client/fontend-client/`: The React frontend application.
- `account-shop/`: The Spring Boot backend service.

## Backend Technologies (`account-shop`)

* **Java**: 21
* **Spring Boot**: 4.0.0
* **Spring Data JPA**: For data persistence and database interaction.
* **Spring Web MVC**: For building web and RESTful applications.
* **Spring Security**: For authentication and access control.
* **Microsoft SQL Server**: The relational database management system.
* **JJWT (Java JWT)**: Version 0.13.0 for generating and parsing JSON Web Tokens.
* **Lombok**: For boilerplate code reduction.
* **Maven**: For dependency management and build automation.

## Frontend Technologies (`fontend-client`)

* **React**: 19.2.0 (via Vite)
* **Vite**: 7.2.4 (Build tool and development server)
* **Axios**: 1.13.2 (For making HTTP requests to the backend)

## Getting Started

### Backend Setup

1. Ensure you have Java 21, Maven, and SQL Server installed.
2. Navigate to the backend directory: `cd account-shop`
3. Build the project: `mvn clean install`
4. Run the application: `mvn spring-boot:run`

### Frontend Setup

1. Ensure you have Node.js installed.
2. Navigate to the frontend directory: `cd fontend-client/fontend-client`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`