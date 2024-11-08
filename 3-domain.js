const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const createDomain = async () => {
  try {
    // Read community.json to get the community ID
    const communityFilePath = path.join(__dirname, 'temp', 'community.json');
    if (!fs.existsSync(communityFilePath)) {
      throw new Error('community.json file not found. Please run 2-checkOrCreateCommunity.js first.');
    }

    const communityData = JSON.parse(fs.readFileSync(communityFilePath, 'utf8'));
    const communityId = communityData.id;

    // Perform GET request to check if the domain already exists
    const getResponse = await axios.get(`${config.destinationApi}domains`, {
      auth: {
        username: config.destinationUserName,
        password: config.destinationPassword,
      },
    });

    const domains = getResponse.data.results;
    const existingDomain = domains.find(domain => domain.name === config.destinationCommunity && domain.community.id === communityId);

    // Create 'temp' directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const domainFilePath = path.join(tempDir, 'domain.json');

    if (existingDomain) {
      // Save existing domain to 'temp/domain.json'
      fs.writeFileSync(domainFilePath, JSON.stringify(existingDomain, null, 2));
      console.log('Domain found and saved to temp/domain.json');
    } else {
      // Prepare payload for domain creation
      const payload = {
        name: config.destinationCommunity,
        communityId: communityId,
        typeId: '00000000-0000-0000-0000-000000030031',
      };

      // Perform POST request to create the domain
      const response = await axios.post(
        `${config.destinationApi}domains`,
        payload,
        {
          auth: {
            username: config.destinationUserName,
            password: config.destinationPassword,
          },
        }
      );

      // Save new domain response to 'temp/domain.json'
      fs.writeFileSync(domainFilePath, JSON.stringify(response.data, null, 2));
      console.log('Domain created and saved to temp/domain.json');
    }
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
};

createDomain();
