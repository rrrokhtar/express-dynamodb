
import { AttributeValue, DeleteItemCommand, ScanCommand, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbDocClient } from "./dynamodb-doc";
import { QueryCommand, ScanCommandInput } from "@aws-sdk/lib-dynamodb";
import { setRegion } from "./dynamodb-client";
export { setRegion };


/**
 * @description Insert or update an item into the table.
 * @param {string} tableName - The name of the table.
 * @param {string} pk - The primary key of the item.
 * @param {object} item - The item to insert or update.
 * @param {string} sk - The secondary key of the item.
 */
export const insertOrUpdate = async (tableName: string, pk: string, item: Record<string, unknown>, sk?: string) => {
    const itemKeys = Object.keys(item).filter((k) => k !== pk && k !== sk);
    if (itemKeys.length === Object.keys(item).length) {
        throw new Error('No partition key is found');
    }
    const params: UpdateItemCommandInput = {
        TableName: tableName,
        Key: { [pk]: { S: (item as never)?.[pk] } },
        ReturnValues: 'ALL_NEW',
    };
    if (itemKeys.length > 0) {
        params.UpdateExpression = `SET ${itemKeys
            .map((_k: unknown, index: number) => `#field${index} = :value${index}`)
            .join(', ')}`;
        params.ExpressionAttributeNames = itemKeys.reduce(
            (accumulator, k, index) => ({ ...accumulator, [`#field${index}`]: k }),
            {},
        );
        params.ExpressionAttributeValues = marshall(
            itemKeys.reduce((accumulator, k, index) => ({ ...accumulator, [`:value${index}`]: item[k] }), {}),
            { removeUndefinedValues: true },
        );
    }
    if (sk && params.Key) {
        params.Key[sk] = { S: (item as never)?.[sk] };
    }
    return await ddbDocClient.send(new UpdateItemCommand(params));
};



/**
 * @description Delete one item by partion key. Assuming existence of that item
 * @param {string} tableName - The name of the table.
 * @param {string} pk - The partion key of the item to be deleted.
 * @param {string} pkValue - The partion key's value of the item.
 */
export const deleteOne = async (tableName: string, pk: string, pkValue: string) => {
    const params = {
        TableName: tableName,
        Key: { [pk]: { S: pkValue } }
    };
    return await ddbDocClient.send(new DeleteItemCommand(params));
}

/**
 * @description Find one item by partion key. Returns null if not found
 * @param {string} tableName - The name of the table.
 * @param {string} pk - The partion key of the item to be found.
 * @param {string} pkValue - The partion key's value of the item.
 */
export const findOne = async (tableName: string, pk: string, pkValue: string) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: `${pk} = :u`,
        ExpressionAttributeValues: {
            ":u": pkValue,
        },
    };
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (!data.Items || data.Items?.length < 1) {
        return null;
    } else {
        return data.Items?.[0];
    }
}

/**
 * @description Find one item by partion key. Returns null if not found
 * @param {string} tableName - The name of the table.
 * @param {string} pk - The partion key of the item to be found.
 * @param {string} pkValue - The partion key's value of the item.
 */
export const findMany = async (tableName: string, pk: string, pkValue: string) => {
    const params = {
        TableName: tableName,
        KeyConditionExpression: `${pk} = :u`,
        ExpressionAttributeValues: {
            ":u": pkValue,
        },
    };
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (!data.Items || data.Items?.length === 0) {
        return [];
    } else {
        return data.Items;
    }
}


/**
 * @description [Scan Command] Find many items by field key. Returns empty array if not found
 * @param {string} tableName - The name of the table.
 * @param {string} field - The field key of the item to be found.
 * @param {string} value - The field's value of the item.
 */
export const findManyByField = async (tableName: string, field: string, value: any) => {
    const params = {
        TableName: tableName,
        FilterExpression: `${field} = :u`,
        ExpressionAttributeValues: {
            ":u": { S: value },
        },
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    if (!data.Items || data.Items?.length < 1) {
        return [];
    } else {
        const items = data.Items.map((item) => {
            return unmarshall(item);
        });
        return items;
    }
}


/**
 * @description [Scan Command] Find many items filter plain expression of dynamodb. Returns empty array if not found
 * @param {string} tableName - The name of the table.
 * @param {string} filterExpression  - The search/filter object which contains the query options
 * @param {object} expressionAttributeValues  - The search/filter object which contains the query options
 */
export const findManyPlain = async (tableName: string, filterExpression: string, expressionAttributeValues: Record<string, AttributeValue>) => {
    const params = {
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeValues: expressionAttributeValues,
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    if (!data.Items || data.Items?.length < 1) {
        return [];
    } else {
        const items = data.Items.map((item) => {
            return unmarshall(item);
        });
        return items;
    }
}

/**
 * @description [Scan Command] Find items by operated filters
 * @param {string} tableName - The name of the table.
 * @param {string} filter - The attributes to be searched and their values in an object type
 * @param {number} operators - The operators for each attribute in an object type
 */
export const findOperated = async (tableName: string, filter: any, operators: { [key: string]: '<' | '<=' | '=' | '>=' | '>' }) => {
    const filterKeys = Object.keys(filter);
    for (const k of filterKeys) {
        if (!operators[k]) {
            throw new Error(`Operator for ${k} not found`);
        }
        if (typeof filter[k] !== 'string' && typeof filter[k] !== 'number') {
            throw new Error(`Value for ${k} is not a string or number`);
        }
    }
    const params: ScanCommandInput = {
        TableName: tableName,
        FilterExpression: `${filterKeys.map((k: any, index: number) => `#field${index} ${operators[k]} :value${index}`).join(' and ')}`,
        ExpressionAttributeNames: filterKeys.reduce((accumulator, k, index) => ({ ...accumulator, [`#field${index}`]: k }), {}),
        ExpressionAttributeValues: marshall(filterKeys.reduce((accumulator, k, index) => ({ ...accumulator, [`:value${index}`]: filter[k] }), {})),
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    if (!data || !data.Items || data.Items?.length < 1) {
        return [];
    } else {
        const items = data.Items.map((item) => {
            return unmarshall(item);
        });
        return items;
    }
}


/**
 * @description [Scan Command] Find one item by primary key. Returns null if not found
 * @param {string} tableName - The name of the table.
 * @param {string} attribute  - The attribute to be searched
 * @param {number} value - The value of the attribute
 */
export const findWithin = async (tableName: string, key: string, start: number, end: number) => {
    const params: ScanCommandInput = {
        TableName: tableName,
        FilterExpression: `${key} BETWEEN :start AND :end`,
        ExpressionAttributeValues: {
            ':start': { N: `${start}` },
            ':end': { N: `${end}` },
        }
    };
    const data = await ddbDocClient.send(new ScanCommand(params));
    if (!data || !data.Items || data.Items?.length < 1) {
        return [];
    } else {
        const items = data.Items.map((item) => {
            return unmarshall(item);
        });
        return items;
    }
}

/**
 * @description Find all items in the table. Returns empty array if not found
 * @param {string} tableName - The name of the table.
 */
async function* findAll(tableName: string, limit: number = 10) {
    const params: ScanCommandInput = {
        TableName: tableName,
        Limit: limit,
    };
    params.ExclusiveStartKey = undefined;
    try {
        do {
            const data = await ddbDocClient.send(new ScanCommand(params));
            if (!data || !data.Items || data.Items?.length < 1) {
                yield [];
            } else {
                const items = data.Items.map((item) => {
                    return unmarshall(item);
                });
                yield items;
            }
            params.ExclusiveStartKey = data.LastEvaluatedKey;
        } while (params.ExclusiveStartKey);
    } catch (e) {
        console.log(e);
    }
}

export { findAll };
