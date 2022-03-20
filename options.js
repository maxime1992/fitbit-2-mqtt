const fs = require('fs');

const FILE_PATH = '/data/options.json';
const OPTIONS = [
  'mqttsPort',
  'fitbitBasicToken',
  'fitbitRefreshToken',
  'fitbitUserId',
];

function readOptions() {
  let options;
  let parsedData;

  try {
    let rawData = fs.readFileSync(FILE_PATH);
    parsedData = JSON.parse(rawData);
  } catch (e) {
    console.log(e);

    throw new Error(`[debug] Couldn't read the options.json file.`);
  }

  OPTIONS.forEach(o => {
    const option = parsedData[o];
    if (!option) {
      const errorMessage = `[debug] Missing option: ${o}`
      console.log(errorMessage);
      throw new Error(errorMessage)
    }
  });

  return parsedData;
}

module.exports = { readOptions };
