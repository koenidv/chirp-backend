# Backend for Chirp: A Twitter clone

We created Chirp, a very simple copy of Twitter to learn about Agile Process Management, Colaboration, Web Technologies and Relational Databases. This repository contains the backend code for Chirp.

[![Website](https://img.shields.io/website?down_message=Offline&label=API%20Status&up_message=Online&url=https%3A%2F%2Fapi.thechirp.de%2Fhealth)](https://api.thechirp.de)
[![Frontend Repository](https://img.shields.io/badge/Repository-Frontend-blue)](https://github.com/TobiasAschenbrenner/twitter-clone-frontend)
[![Postman Docs](https://img.shields.io/badge/Docs-Postman-orange)](https://lively-flare-730471.postman.co/workspace/Chirp~afca99b0-c47a-4215-8c99-a25d79e212a0/api/15277022-5be5-4bf6-b392-4d909e436d00)
[![Swagger Docs](https://img.shields.io/badge/Docs-Swagger%20UI-green)](https://docs.api.thechirp.de)

The backend is built on Deno + Oak and currently deployed on [Deno Deploy](https://deno.dev). It uses synchronous JWTs for authorization and a Cockroach database on [Cockroach Labs](https://www.cockroachlabs.com). However, apart from Row-Based TTL, our implementation is compatible to PostgreSQL.
The system additionally interacts with [MailerSend](https://mailersend.com) for sending emails to users and [ImageKit.io](https://imagekit.io) for storing user data.

[The frontend repository can be found here](https://github.com/TobiasAschenbrenner/twitter-clone-frontend)

### Running locally
1. If you haven't already, [install deno](https://deno.land/manual@v1.32.1/getting_started/installation)
2. Get the .env or new keys for each [environment variable](#environment-variables)
3. Run `deno run -A main.ts`

### Documentation
The public interactive API documentation can be found at [docs.api.thechirp.de](https://docs.api.thechirp.de).  
If you prefer using Postman, you can refer to the badge above. Please note joining the Postman Team requires manual approval.

### Environment Variables
Make sure to include these paramters in your environment to make the service work:
- DATABASE_URL - Connection string to your Cockroach database
- JWT_KEY - 256bit synchronous key for JWT signing
- MAILERSEND_KEY - API key for MailerSend
- CDN_KEY API key for ImageKit.io

### Deploying
This project is continuously deployed on Deno Deploy on pushes to main.  
If you'd rather deploy on your own infrastructure, a Dockerfile is set up.
However, the database will not be set up automatically and you will have to run ./db/makeTables.ts manually.

### Project Architecture
![Project Architecture](https://user-images.githubusercontent.com/32238636/233811626-123ae315-ac88-430c-b723-9f759e9084e2.png)

### Data Model
![ERD](https://user-images.githubusercontent.com/32238636/233807862-48738e40-b229-41fc-9754-92294f36f34a.png)
