import logging
import struct
import sys

import structlog

def setup_logging(service_name: str, level: str = "INFO") -> None:
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.CallsiteParameterAdder(
            parameters={
                structlog.processors.CallsiteParameter.MODULE,
                structlog.processors.CallsiteParameter.FUNC_NAME,
                structlog.processors.CallsiteParameter.LINENO,
            }
        ),
        structlog.processors.TimeStamper(fmt="iso", utc=True), # ISO - это временная метка в базовой структуре YYYY-MM-DD T hh:mm:ssZ

        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info
    ]

    formatter = structlog.stdlib.ProcessorFormatter(processor=structlog.processors.JSONRenderer(), foreign_pre_chain=shared_processors)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(level)

    structlog.configure(processors=[
        *shared_processors,
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter
    ], logger_factory=structlog.stdlib.LoggerFactory(), wrapper_class=structlog.stdlib.BoundLogger, cache_logger_on_first_use=True)

    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(service_name=service_name)