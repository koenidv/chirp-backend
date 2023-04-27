# Backend for Chirp: A Twitter clone

We created Chirp, a very simple copy of Twitter to learn about Agile Process Management, Colaboration, Web Technologies and Relational Databases. This repository contains the backend code for Chirp.

[![Website](https://img.shields.io/website?down_message=Offline&label=API%20Status&up_message=Online&url=https%3A%2F%2Fapi.thechirp.de%2Fhealth)](https://api.thechirp.de)
[![Frontend Repository](https://img.shields.io/badge/Repository-Frontend-blue)](https://github.com/TobiasAschenbrenner/twitter-clone-frontend)
[![Postman Docs](https://img.shields.io/badge/Docs-Postman-orange)](https://lively-flare-730471.postman.co/workspace/Chirp~afca99b0-c47a-4215-8c99-a25d79e212a0/api/15277022-5be5-4bf6-b392-4d909e436d00)
[![Swagger Docs](https://img.shields.io/badge/Docs-Swagger%20UI-green)](https://docs.api.thechirp.de)

The backend is built on Deno + Oak and currently deployed on [Deno Deploy](https://deno.dev). It uses synchronous JWTs for authorization and a Cockroach database on [Cockroach Labs](https://www.cockroachlabs.com). However, apart from Row-Based TTL, our implementation is compatible to PostgreSQL.
The system additionally interacts with [MailerSend](https://mailersend.com) for sending emails to users and [ImageKit.io](https://imagekit.io) for storing user data.

[The frontend repository can be found here](https://github.com/TobiasAschenbrenner/twitter-clone-frontend)

## Servers

The API is publicly accessible using the proper user.
authentication.

Production Server: `https://api.thechirp.de`  
Sandbox Server: `https://sandbox.api.thechirp.de`

If you stumble across a *chirp.koenidv.de*, it is equivalent to *thechirp.de*.

## Running locally

1. If you haven't already, [install deno](https://deno.land/manual@v1.32.1/getting_started/installation)
2. Get the .env or new keys for each [environment variable](#environment-variables)
3. Run `deno run -A main.ts`

## Documentation

The public interactive API documentation can be found at [docs.api.thechirp.de](https://docs.api.thechirp.de).  
If you prefer using Postman, you can refer to the badge above. Please note joining the Postman Team requires manual approval.

## Testing

Run tests using `deno test`.

### Mock Server

The *GET* methods at and below */v1/tweet* and */v1/user* are available as mocked endpoints for frontend testing. Simply direct your requests to `https://a092a8fb-fc57-4e0e-b09f-3f41170486b0.mock.pstmn.io`.

Mocked user: *halbunsichtbar*  
Mocked tweet: *72969718891000*  
Mocked comment: *73013027891000*  

## Load Testing

Load testing is done using [Locust](https://locust.io) against *localhost* (testing database integration) or the sandbox server.

To start Locus, use:  
`locust -f ./locust/locustfile.py --headless -H http://sandbox.api.thechirp.de/v1 -u 15 -r 1 -t 5m`

Refer to the [Locust documentation](https://docs.locust.io/en/stable/configuration.html) for more information.

## Environment Variables

Make sure to include these paramters in your environment to make the service work:

- DATABASE_URL - Connection string to your Cockroach database
- JWT_KEY - 256bit synchronous key for JWT signing
- MAILERSEND_KEY - API key for MailerSend
- CDN_KEY API key for ImageKit.io

## Deploying

This project is continuously deployed on Deno Deploy on pushes to main.  
If you'd rather deploy on your own infrastructure, a Dockerfile is set up.
However, the database will not be set up automatically and you will have to run ./db/makeTables.ts manually.

## Project Architecture

![Project Architecture](https://user-images.githubusercontent.com/32238636/234537319-c985eb14-b7b1-4aee-9dec-dc9f81e96af7.png)

## Data Model

![ERD](https://user-images.githubusercontent.com/32238636/233807862-48738e40-b229-41fc-9754-92294f36f34a.png)
