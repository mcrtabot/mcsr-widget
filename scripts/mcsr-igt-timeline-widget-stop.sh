#!/bin/bash

cd $(dirname $0)

docker-compose down -v

echo -n "何かキーを押してください..."
read
