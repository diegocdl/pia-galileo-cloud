const {
  RekognitionClient,
  DetectLabelsCommand
} = require('@aws-sdk/client-rekognition');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const rekognition = new RekognitionClient({
  region: 'us-west-2'
});
const dynamodb = new DynamoDBClient();

exports.processImage = async (event) => {
  try {
    // Get the S3 bucket and key from the event
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );

    // Configure parameters for Rekognition
    const params = {
      Image: {
        S3Object: {
          Bucket: bucket,
          Name: key
        }
      },
      MaxLabels: 20,
      MinConfidence: 70
    };

    // Detect labels using Rekognition
    const detectLabelsCommand = new DetectLabelsCommand(params);
    const rekognitionResponse = await rekognition.send(detectLabelsCommand);

    // Process the labels and look for specific items
    const labels = rekognitionResponse.Labels;
    const detectedObjects = {
      commonObjects: [],
      persons: false,
      weapons: false
    };

    labels.forEach((label) => {
      if (label.Name === 'Person') {
        detectedObjects.persons = true;
      } else if (['Gun', 'Weapon', 'Rifle', 'Pistol'].includes(label.Name)) {
        detectedObjects.weapons = true;
      } else {
        detectedObjects.commonObjects.push({
          name: label.Name,
          confidence: label.Confidence
        });
      }
    });

    // Store results in DynamoDB
    const dynamoParams = {
      TableName: 'image-analysis-results',
      Item: {
        image_name: { S: key },
        analysis_results: { S: JSON.stringify(detectedObjects) },
        timestamp: { S: new Date().toISOString() }
      }
    };

    const putCommand = new PutItemCommand(dynamoParams);
    await dynamodb.send(putCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Image processed successfully',
        results: detectedObjects
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing image',
        error: error.message
      })
    };
  }
};
