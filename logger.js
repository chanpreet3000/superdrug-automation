import path from 'path';
import {fileURLToPath} from 'url';
import chalk from "chalk";
import util from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
  static #projectRoot = path.resolve(__dirname, '..');

  static #getLogDetails() {
    const stackTrace = new Error().stack.split('\n');
    let callerLine;
    for (let i = 2; i < stackTrace.length; i++) {
      if (!stackTrace[i].includes('logger.js')) {
        callerLine = stackTrace[i];
        break;
      }
    }

    const match = callerLine.match(/at (?:(.+) \()?(.+):(\d+):(\d+)/);
    let fileName = match ? match[2] : 'unknown';
    const lineNumber = match ? match[3] : 'unknown';
    const columnNumber = match ? match[4] : 'unknown';

    // Handle 'file:' protocol in the file path
    if (fileName.startsWith('file:')) {
      fileName = fileURLToPath(fileName);
    }

    let relativeFileName = path.relative(Logger.#projectRoot, fileName);
    if (!relativeFileName.startsWith('..') && !path.isAbsolute(relativeFileName)) {
      relativeFileName = '/' + relativeFileName;
    }
    relativeFileName = relativeFileName.replace(/\\/g, '/');

    const filePathInfo = `.${relativeFileName}:${lineNumber}:${columnNumber}`;

    const timestamp = new Date().toISOString();

    return {timestamp, filePathInfo};
  }

  static #formatDetails(details) {
    if (details === null) return 'None';
    if (typeof details === 'object') {
      return util.inspect(details, {depth: null, colors: true});
    }
    return details;
  }

  static #log(message, details, level) {
    const {timestamp, filePathInfo} = Logger.#getLogDetails();

    const coloredFilePath = chalk.white(filePathInfo);

    let coloredLogLevel, coloredMessage;
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

    const coloredDetails = Logger.#formatDetails(details);
    const logMessage = `${timestamp.padEnd(30)} ${coloredLogLevel.padEnd(20)} ${coloredFilePath.padEnd(60)} : ${coloredMessage} - ${coloredDetails}`;
    console.log(logMessage);
  }

  static debug(message, details = null) {
    Logger.#log(message, details, 'DEBUG');
  }

  static info(message, details = null) {
    Logger.#log(message, details, 'INFO');
  }

  static warn(message, details = null) {
    Logger.#log(message, details, 'WARN');
  }

  static error(message, details = null) {
    Logger.#log(message, details, 'ERROR');
  }

  static critical(message, details = null) {
    Logger.#log(message, details, 'CRITICAL');
  }
}

export default Logger;