// Create the DynamoDB service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Set the AWS Region.
// Create an Amazon DynamoDB service client object.
let DynamoDB_REGION = process.env.REGION;
let AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID!;
let AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY!;
let ddbClient = new DynamoDBClient({ region: DynamoDB_REGION });

const setRegion = (region: string) => {
  DynamoDB_REGION = region;
  ddbClient = new DynamoDBClient({ region: region, credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY } });
}

const setAccessKey = (accessKey: { accessKeyId: string, secretAccessKey: string }) => {
  AWS_ACCESS_KEY_ID = accessKey.accessKeyId;
  AWS_SECRET_ACCESS_KEY = accessKey.secretAccessKey;
  ddbClient = new DynamoDBClient({
    region: DynamoDB_REGION, credentials: {
      accessKeyId: accessKey.accessKeyId,
      secretAccessKey: accessKey.secretAccessKey
    }
  });
}

const setConfig = (accessKey: { accessKeyId: string, secretAccessKey: string }, region?: string) => {
  DynamoDB_REGION = region ?? DynamoDB_REGION;
  ddbClient = new DynamoDBClient({ region: DynamoDB_REGION, credentials: accessKey });
}

export { ddbClient, setRegion, setAccessKey, setConfig }