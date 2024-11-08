const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const checkOrCreateCommunity = async () => {
  try {
    // Perform GET request to fetch communities from destinationApi
    const response = await axios.get(`${config.destinationApi}communities`, {
      auth: {
        username: config.destinationUserName,
        password: config.destinationPassword,
      },
    });

    const communities = response.data.results;
    const community = communities.find(comm => comm.name === config.destinationCommunity);

    // Create 'temp' directory if it doesn't exist
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const filePath = path.join(tempDir, 'community.json');

    if (community) {
      // Save existing community to 'temp/community.json'
      fs.writeFileSync(filePath, JSON.stringify(community, null, 2));
      console.log('Community found and saved to temp/community.json');
    } else {
      // Perform POST request to create the community
      const postResponse = await axios.post(
        `${config.destinationApi}communities`,
        { name: config.destinationCommunity },
        {
          auth: {
            username: config.destinationUserName,
            password: config.destinationPassword,
          },
        }
      );

      // Save new community response to 'temp/community.json'
      fs.writeFileSync(filePath, JSON.stringify(postResponse.data, null, 2));
      console.log('Community created and saved to temp/community.json');
    }
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
};

checkOrCreateCommunity();
