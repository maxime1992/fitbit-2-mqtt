const axios = require('axios');
const fs = require('fs');

const FILE_PATH = '/data/data.json';

async function getToken(options) {
  let accessToken;
  let refreshToken;

  try {
    let rawData = fs.readFileSync(FILE_PATH);
    const parsedData = JSON.parse(rawData);

    if (
      parsedData.initRefreshToken === options.fitbitRefreshToken &&
      parsedData.refreshToken
    ) {
      console.log('[debug] Using refresh token from cache');
      refreshToken = parsedData.refreshToken;
    } else {
      console.log('[debug] Using init refresh token');
      refreshToken = options.fitbitRefreshToken;
      fs.writeFileSync(
        FILE_PATH,
        JSON.stringify({
          initRefreshToken: options.fitbitRefreshToken,
          refreshToken: null,
        })
      );
    }
  } catch (error) {
    refreshToken = options.fitbitRefreshToken;

    fs.writeFileSync(
      FILE_PATH,
      JSON.stringify({
        initRefreshToken: options.fitbitRefreshToken,
        refreshToken: null,
      })
    );
  }

  try {
    res = await axios({
      method: 'post',
      url: 'https://api.fitbit.com/oauth2/token',
      headers: {
        Authorization: `Basic ${options.fitbitBasicToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': undefined,
      },
      responseType: 'json',
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });

    accessToken = res.data.access_token;

    fs.writeFileSync(
      FILE_PATH,
      JSON.stringify({
        initRefreshToken: options.fitbitRefreshToken,
        refreshToken: res.data.refresh_token,
      })
    );

  } catch (error) {
    console.log('[debug] Something went wrong while trying to refresh the token');
    if (error.response) {
      // console.log('[debug] response', error.response);
    } else if (error.request) {
      // console.log('[debug] request', error.request);
    } else if (error.message) {
      // console.log('[debug] message', error.message);
    }

    throw error;
  }

  return accessToken;
}

// example of params
// amount: 500
// unit: 'ml'
async function addWater(options, amount, unit) {
  let accessToken
  
  try {
    accessToken = await getToken(options);
  } catch (error) {
    console.log('Failed to get the token');
  }

  const now = new Date();

  now.setDate(now.getDate());

  const day = ('0' + now.getDate()).slice(-2);
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const year = now.getFullYear();

  console.log(`[debug] Trying to add water: ${amount} ${unit}`);
  
  try {
    const addWaterResponse = await axios({
      method: 'post',
      url: `https://api.fitbit.com/1/user/${options.fitbitUserId}/foods/log/water.json?date=${year}-${month}-${day}&amount=${amount}&unit=${unit}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': undefined,
      },
    });

    console.log(`[debug] Add water response: ${addWaterResponse.data}`);
  } catch (error) {
    console.log('[debug] Error while trying to add watter');
  }
};

module.exports = { addWater };