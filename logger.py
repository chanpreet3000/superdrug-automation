import logging
import inspect
import os
from datetime import datetime
from colorama import Fore, init

init(autoreset=True)


class Logger:
    __logger = logging.getLogger(__name__)
    __logger.setLevel(logging.DEBUG)
    __handler = logging.StreamHandler()
    __formatter = logging.Formatter("%(message)s")
    __handler.setFormatter(__formatter)
    __logger.addHandler(__handler)

    @staticmethod
    def __get_project_root():
        return os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

    @staticmethod
    def __get_log_details():
        frame = inspect.stack()[3]
        file_name = frame.filename
        line_number = frame.lineno

        project_root = Logger.__get_project_root()
        relative_file_name = os.path.relpath(file_name, project_root)
        relative_file_name = f"./{relative_file_name.replace(os.sep, '/')}"

        timestamp = datetime.utcnow().isoformat()
        pid = os.getpid()

        file_path_info = f"{relative_file_name}:{line_number}"
        return timestamp, pid, file_path_info

    @staticmethod
    def __log(message, details, level):
        timestamp, pid, file_path_info = Logger.__get_log_details()

        # Color the timestamp white
        colored_timestamp = f"{Fore.WHITE}{timestamp:<30}"

        # Color the log level according to its severity
        if level == logging.DEBUG:
            colored_log_level = f"{Fore.CYAN}{logging.getLevelName(level):<10}"
            colored_message = f"{Fore.CYAN}{message:<60}"
        elif level == logging.INFO:
            colored_log_level = f"{Fore.GREEN}{logging.getLevelName(level):<10}"
            colored_message = f"{Fore.GREEN}{message:<60}"
        elif level == logging.WARNING:
            colored_log_level = f"{Fore.YELLOW}{logging.getLevelName(level):<10}"
            colored_message = f"{Fore.YELLOW}{message:<60}"
        elif level == logging.ERROR:
            colored_log_level = f"{Fore.RED}{logging.getLevelName(level):<10}"
            colored_message = f"{Fore.RED}{message:<60}"
        else:
            colored_log_level = f"{Fore.MAGENTA}{logging.getLevelName(level):<10}"
            colored_message = f"{Fore.MAGENTA}{message:<60}"

        # Color the PID blue
        colored_pid = f"{Fore.BLUE}PID:{pid:<7}"

        # Color the file path white
        colored_file_path = f"{Fore.WHITE}{file_path_info:<60}"

        # Color the details bright white
        colored_details = f"{Fore.LIGHTWHITE_EX}{details}"

        log_message = f"{colored_timestamp} {colored_pid} {colored_log_level} {colored_file_path} : {colored_message}  -  {colored_details}"

        if level == logging.DEBUG:
            Logger.__logger.debug(log_message)
        elif level == logging.INFO:
            Logger.__logger.info(log_message)
        elif level == logging.WARNING:
            Logger.__logger.warning(log_message)
        elif level == logging.ERROR:
            Logger.__logger.error(log_message)
        elif level == logging.CRITICAL:
            Logger.__logger.critical(log_message)
        else:
            Logger.__logger.info(log_message)

    @staticmethod
    def debug(message, details=None):
        Logger.__log(message, details, logging.DEBUG)

    @staticmethod
    def info(message, details=None):
        Logger.__log(message, details, logging.INFO)

    @staticmethod
    def warn(message, details=None):
        Logger.__log(message, details, logging.WARNING)

    @staticmethod
    def error(message, details=None):
        Logger.__log(message, details, logging.ERROR)

    @staticmethod
    def critical(message, details=None):
        Logger.__log(message, details, logging.CRITICAL)
