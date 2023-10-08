#!/bin/bash

cd $(dirname $0)

docker-compose down

echo -n "何かキーを押してください..."
read
