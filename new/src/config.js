require('dotenv').config();

const apiBaseUrl = process.env.API_BASE_URL 

const config = {
  apiBaseUrl: apiBaseUrl, 
  port: process.env.PORT
};

export default config;
