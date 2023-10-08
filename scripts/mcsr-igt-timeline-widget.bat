@ECHO OFF
CHCP 65001

WHERE /Q docker-compose
IF not %ERRORLEVEL% == 0 (
    ECHO.
    ECHO docker-compose コマンドが見つかりません
    ECHO.
    ECHO 以下のリンクをよりDocker Desktopをインストールしてください。
    ECHO https://docs.docker.jp/docker-for-windows/install.html
    ECHO.

    PAUSE
    EXIT 1
)

docker ps > nul 2>&1
IF not %ERRORLEVEL% == 0 (
    ECHO.
    ECHO Dockerデーモンが実行されていません
    ECHO.
    ECHO Docker Desktopを起動してから、再度 mcsr-widget を実行してください。
    ECHO.

    PAUSE
    EXIT 1
)

ECHO Minecraft Speedrun IGT Timeline Widgetを起動します...

docker-compose up -d
IF not %ERRORLEVEL% == 0 (
    ECHO.
    ECHO 起動に失敗しました
    ECHO.

    PAUSE
    EXIT 1
)

start http://127.0.0.1:1161
