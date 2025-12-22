const LineByLineReader = require('line-by-line');
const { unstyle } = require('ansi-colors');

/**
 *
 * @param {ReadableStream} stream
 * @returns {LineByLineReader}
 */
function logReader(stream) {
  const reader = new LineByLineReader(stream);
  reader.pause();

  return reader;
}

/**
 *
 * @param {string} text
 * @param {LineByLineReader} stream
 * @returns
 */
function waitFor(text, stream) {
  return new Promise((resolve, reject) => {
    console.log('Waiting for', text);
    const reader = (line) => {
      const content = unstyle(line);
      console.log(`[${text}]: LINE ${content}`);

      if (content.includes(text)) {
        console.log(`[${text}]: FOUND '${content}'`);
        stream.off('line', reader);
        stream.off('error', reject);
        stream.pause();

        resolve(content.slice(content.lastIndexOf(text) + text.length));
      }
    };

    stream.on('line', reader);
    stream.on('error', reject);
    stream.resume();
  });
}

module.exports = {
  logReader,
  waitFor,
};
