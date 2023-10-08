FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

RUN mkdir app

WORKDIR /app

COPY Pipfile.lock /app/

RUN pip install -U pip && \
    pip install pipenv==2021.5.29 && \
    pipenv sync --system && \
    pip uninstall --yes pipenv