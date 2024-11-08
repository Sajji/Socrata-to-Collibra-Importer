const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const getSourceApiData = async () => {
  try {
    // Perform GET request from sourceApi
    const response = await axios.get(config.sourceApi);
    const data = response.data;

    // Create 'temp' directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Save response to 'temp/sourceData.json'
    const filePath = path.join(tempDir, 'sourceData.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log('Data saved successfully to temp/sourceData.json');
  } catch (error) {
    console.error('Error fetching source API data:', error.message);
  }
};

getSourceApiData();
