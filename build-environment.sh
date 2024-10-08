#!/bin/bash

# Run docker compose app file
docker compose -f docker-compose/app/docker-compose.yml up -d

# Run docker compose app-proxy file
docker compose -f docker-compose/app-proxy/docker-compose.yml up -d
