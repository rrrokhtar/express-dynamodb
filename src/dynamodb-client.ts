// Create the DynamoDB service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Set the AWS Region.
// Create an Amazon DynamoDB service client object.
let DynamoDB_REGION = process.env.REGION;
let ddbClient = new DynamoDBClient({ region: DynamoDB_REGION });

const setRegion = (region: string) => {
  DynamoDB_REGION = region;
  ddbClient = new DynamoDBClient({ region: region });
}

const setAccessKey = (accessKey: { accessKeyId: string, secretAccessKey: string }) => {
  ddbClient = new DynamoDBClient({ region: DynamoDB_REGION, credentials: accessKey });
}

const setConfig = (accessKey: { accessKeyId: string, secretAccessKey: string }, region?: string) => {
  DynamoDB_REGION = region ?? DynamoDB_REGION;
  ddbClient = new DynamoDBClient({ region: DynamoDB_REGION, credentials: accessKey });
}

export { ddbClient, setRegion, setAccessKey, setConfig }