from logging import config


def setup_logger() -> None:
    logger_config = {
        "version": 1,
        "formatters": {
            "customFormatter": {
                "format": "[%(asctime)s] [%(thread)d-%(threadName)s] %(levelname)s %(module)s.%(funcName)s:%(lineno)d %(message)s",  # NOQA
                "datefmt": "%Y-%m-%d %H:%M:%S",
            }
        },
        "loggers": {
            "console": {
                "handlers": ["consoleHandler"],
                "level": "INFO",
                "qualname": "console",
                "propagate": True,
            },
        },
        "handlers": {
            "consoleHandler": {
                "class": "logging.StreamHandler",
                "level": "INFO",
                "formatter": "customFormatter",
                "stream": "ext://sys.stdout",
            },
        },
        "root": {"level": "INFO", "handlers": ["consoleHandler"]},
        "disable_existing_loggers": False,
    }

    config.dictConfig(logger_config)
