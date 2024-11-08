const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const createDataSets = async () => {
  try {
    // Read sourceData.json file
    const sourceFilePath = path.join(__dirname, 'temp', 'sourceData.json');
    if (!fs.existsSync(sourceFilePath)) {
      throw new Error('sourceData.json file not found. Please make sure to run 1-getSourceApi.js first.');
    }
    const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));

    // Read domain.json file to get domain ID
    const domainFilePath = path.join(__dirname, 'temp', 'domain.json');
    if (!fs.existsSync(domainFilePath)) {
      throw new Error('domain.json file not found. Please make sure to run 3-createDomain.js first.');
    }
    const domainData = JSON.parse(fs.readFileSync(domainFilePath, 'utf8'));
    const domainId = domainData.id;

    // Read attributeTypes.json to get attribute type mappings
    const attributeTypesFilePath = path.join(__dirname, 'attributeTypes.json');
    if (!fs.existsSync(attributeTypesFilePath)) {
      throw new Error('attributeTypes.json file not found. Please make sure it is available in the root directory.');
    }
    const attributeTypes = JSON.parse(fs.readFileSync(attributeTypesFilePath, 'utf8'));

    // Iterate through sourceData and create datasets (assets)
    for (const dataset of sourceData) {
      const payload = {
        name: dataset.id,
        displayName: dataset.name,
        typeId: '00000000-0000-0000-0001-000400000001',
        domainId: domainId,
      };

      // Perform POST request to create asset
      try {
        const response = await axios.post(
          `${config.destinationApi}assets`,
          payload,
          {
            auth: {
              username: config.destinationUserName,
              password: config.destinationPassword,
            },
          }
        );
        console.log(`Dataset ${dataset.name} created successfully:`);

        // Extract the created asset ID
        const assetId = response.data.id;

        // Collect all attributes for the dataset
        const attributesPayload = [];
        for (const [key, value] of Object.entries(dataset)) {
          if (key === 'id' || key === 'name') continue;

          // Replace null values with "Value not provided"
          let attributeValue = value === null ? 'Value not provided' : value;

          // If the value is an array or object, stringify it
          if (Array.isArray(attributeValue) || typeof attributeValue === 'object') {
            attributeValue = JSON.stringify(attributeValue);
          }

          // Find matching attribute type by name
          const attributeType = attributeTypes.find(attr => attr.name === `${key} - Socrata`);
          if (attributeType) {
            attributesPayload.push({
              assetId: assetId,
              typeId: attributeType.id,
              value: attributeValue,
            });
          } else {
            console.warn(`No matching attribute type found for key: ${key}`);
          }
        }

        // Perform bulk POST request to create all attributes for the dataset
        if (attributesPayload.length > 0) {
          try {
            const bulkResponse = await axios.post(
              `${config.destinationApi}attributes/bulk`,
              attributesPayload,
              {
                auth: {
                  username: config.destinationUserName,
                  password: config.destinationPassword,
                },
              }
            );
            console.log(`Attributes for dataset ${dataset.name} created successfully:`);
          } catch (bulkError) {
            console.error(`Error creating attributes for asset ${dataset.name}:`, bulkError);
          }
        }
      } catch (postError) {
        console.error(`Error creating dataset ${dataset.name}:`, postError.message);
      }
    }
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
};

createDataSets();
