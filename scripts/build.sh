#!/bin/bash

cd $(dirname $0)/..

rm -rf dist
mkdir dist

cd web
yarn build

cd ../
mv web/build dist/html
cp -pr \
    app \
    setting \
    docker-compose.yml \
    .env \
    scripts/mcsr-igt-timeline-widget.bat \
    scripts/mcsr-igt-timeline-widget-stop.bat \
    scripts/mcsr-igt-timeline-widget.sh \
    scripts/mcsr-igt-timeline-widget-stop.sh \
    docs/readme.txt \
    dist/.
