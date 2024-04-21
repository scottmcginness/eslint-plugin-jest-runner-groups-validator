const dedentCore = require('dedent');
const { EOL } = require('os');

/**
 * @param {TemplateStringsArray} str
 * @param {any[]} [args]
 */
const dedent = (str, args) => (args ? dedentCore(str, args) : dedentCore(str)).split(/[\r\n]/g).join(EOL);

module.exports = dedent;
