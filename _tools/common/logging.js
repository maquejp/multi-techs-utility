import chalk from 'chalk';

export const cl = console.log;
export const cr = console.error;

// Chalk
export const ckr = (msg) => chalk.red(`${msg}`);      // Error
export const cky = (msg) => chalk.yellow(`${msg}`);   // Warning
export const ckg = (msg) => chalk.green(`${msg}`);    // Success
export const ckgr = (msg) => chalk.gray(`${msg}`);    // Info
export const ckc = (msg) => chalk.cyan(`${msg}`);     // Highlight
export const ckm = (msg) => chalk.magenta(`${msg}`);  // Action
export const ckb = (msg) => chalk.blue(`${msg}`); // Blue