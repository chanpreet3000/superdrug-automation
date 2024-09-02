import path from 'path';
import {fileURLToPath} from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  static getProjectRoot() {
    return path.resolve(__dirname, '..', '..');
  }

  static getLogDetails() {
    const err = new Error();
    const stack = err.stack.split('\n')[3].trim();
    const match = stack.match(/at (.+) \((.+):(\d+):\d+\)/) || stack.match(/at (.+):(\d+):\d+/);
    let fileName = match[2];
    const lineNumber = match[3];

    if (fileName.startsWith('file:///')) {
      fileName = fileURLToPath(fileName);
    } else if (fileName.startsWith('file:/')) {
      fileName = path.resolve(fileName.replace('file:/', ''));
    }

    const projectRoot = Logger.getProjectRoot();
    const relativeFileName = path.relative(projectRoot, fileName).replace(/\\/g, '/');
    const filePathInfo = `./${relativeFileName}:${lineNumber}`;

    const timestamp = new Date().toISOString();
    const pid = process.pid;

    return {timestamp, pid, filePathInfo};
  }

  static log(message, level = 'INFO', obj = null) {
    const {timestamp, pid, filePathInfo} = Logger.getLogDetails();

    let coloredTimestamp = chalk.white(timestamp);
    let coloredPid = chalk.blue(`PID:${pid}`);
    let coloredFilePath = chalk.white(filePathInfo);

    let coloredLogLevel;
    let coloredMessage;

    switch (level) {
      case 'DEBUG':
        coloredLogLevel = chalk.cyan(level);
        coloredMessage = chalk.cyan(message);
        break;
      case 'INFO':
        coloredLogLevel = chalk.green(level);
        coloredMessage = chalk.green(message);
        break;
      case 'WARN':
        coloredLogLevel = chalk.yellow(level);
        coloredMessage = chalk.yellow(message);
        break;
      case 'ERROR':
        coloredLogLevel = chalk.red(level);
        coloredMessage = chalk.red(message);
        break;
      case 'CRITICAL':
        coloredLogLevel = chalk.magenta(level);
        coloredMessage = chalk.magenta(message);
        break;
      default:
        coloredLogLevel = chalk.white(level);
        coloredMessage = chalk.white(message);
    }

    const logMessage = `${coloredTimestamp} ${coloredPid} ${coloredLogLevel} ${coloredFilePath}  -  ${coloredMessage}`;

    if (obj) {
      console.log(logMessage, obj);
    } else {
      console.log(logMessage);
    }
  }

  static debug(message, obj = null) {
    Logger.log(message, 'DEBUG', obj);
  }

  static info(message, obj = null) {
    Logger.log(message, 'INFO', obj);
  }

  static warn(message, obj = null) {
    Logger.log(message, 'WARN', obj);
  }

  static error(message, obj = null) {
    Logger.log(message, 'ERROR', obj);
  }

  static critical(message, obj = null) {
    Logger.log(message, 'CRITICAL', obj);
  }
}

export default Logger;
