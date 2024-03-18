// Create the DynamoDB service client module using ES6 syntax.
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// Set the AWS Region.
// Create an Amazon DynamoDB service client object.
const DynamoDB_REGION = process.env.REGION;
let ddbClient = new DynamoDBClient({ region: DynamoDB_REGION });

const setRegion = (region: string) => {
  ddbClient = new DynamoDBClient({ region: region });
}

export { ddbClient, setRegion }