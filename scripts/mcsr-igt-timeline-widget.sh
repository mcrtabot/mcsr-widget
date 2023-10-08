#!/bin/bash

cd $(dirname $0)

which docker-compose > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo
    echo docker-compose コマンドが見つかりません
    echo
    echo 以下のリンクをよりDocker Desktopをインストールしてください。
    echo https://matsuand.github.io/docs.docker.jp.onthefly/desktop/mac/install/
    echo

    echo -n "何かキーを押してください..."
    read
    exit 1
fi

docker ps > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo
    echo Dockerデーモンが実行されていません
    echo
    echo Docker Desktopを起動してから、再度 mcsr-widget を実行してください。
    echo

    echo -n "何かキーを押してください..."
    read
    exit 1
fi


docker-compose up -d
if [ $? -ne 0 ]; then
    echo
    echo 起動に失敗しました
    echo

    echo -n "何かキーを押してください..."
    read
    exit 1
fi

open http://127.0.0.1:1161
