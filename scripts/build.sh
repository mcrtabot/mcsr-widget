#!/bin/bash

if [ "$1" == "" ]; then
    echo バージョンを指定してください
    exit 1
fi

version="$1"
release_name="mcsr-igt-timeline-widget-${version}"
echo "${release_name}"

cd $(dirname $0)/..

rm -rf mcsr-igt-timeline-widget-*
mkdir "${release_name}"

cd web
yarn build

cd ../
mv web/build "${release_name}"/html
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
    ${release_name}/.

zip -r ${release_name}.zip ${release_name}