#!/bin/bash
# DB import script for dockerized postgres
# Usage: ./import-toolkit.sh <command> <container_name> <file_name>

# Check if container name is provided
if [ -z "$1" ]; then
  echo "Container name is required"
  exit 1
fi

# Check if file name is provided
if [ -z "$2" ]; then
  echo "File name is required"
  exit 1
fi

# Check if file exists
if [ ! -f "$2" ]; then
  echo "File does not exist"
  exit 1
fi

# Check if docker is running
if [ -z "$(docker ps)" ]; then
  echo "Docker is not running"
  exit 1
fi

# Check if container name is an existing docker container
if [ -z "$(docker ps -a | grep $1)" ]; then
  echo "Container does not exist"
  exit 1
fi

# Import DB into dockerized postgres
docker exec -i $1 psql -U postgres -d postgres < $2

# Check if import was successful
if [ $? -eq 0 ]; then
  echo "Import successful"
else
  echo "Import failed"
fi
