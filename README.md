# express-dynamodb

express-dynamodb is a wrapper package for DynamoDB that simplifies its usage. It provides convenient functions for common operations such as inserting or updating items, deleting items, and querying items based on different criteria.

## Installation

```bash
npm install express-dynamodb
```

## Usage

```javascript
import { insertOrUpdate, deleteOne, findOne, findMany, findManyByField, findManyPlain, findOperated, findWithin, findAll, setRegion } from 'express-dynamodb';

// Set the AWS region
setRegion('us-east-1');

// Insert or update an item
await insertOrUpdate('tableName', 'pk', item, 'sk');

// Delete an item
await deleteOne('tableName', 'pk', 'pkValue');

// Find one item by partition key
const result = await findOne('tableName', 'pk', 'pkValue');

// Find many items by partition key
const results = await findMany('tableName', 'pk', 'pkValue');

// Find many items by field
const resultsByField = await findManyByField('tableName', 'field', 'value');

// Find many items using plain DynamoDB expression
const resultsPlain = await findManyPlain('tableName', 'filterExpression', {':u': 'value'});

// Find items using operated filters
const operatedResults = await findOperated('tableName', { attribute: value }, { attribute: '<' });

// Find items within a range
const resultsWithinRange = await findWithin('tableName', 'key', start, end);

// Find all items in the table
const batchSize = 100;
let res;
let iterator = findAll('tableName', batchSize);
while ((res = await iterator.next()) && !res.done) {
  for (const val of res.value) {
    console.log(val);
  }
}
```

## API

### setRegion(region: string)

Sets the AWS region for DynamoDB operations.

- `region`: The AWS region (e.g., 'us-east-1').

### insertOrUpdate(tableName: string, pk: string, item: any, sk?: string): Promise\<void\>

Inserts or updates an item in the table.

- `tableName`: The name of the table.
- `pk`: The partition key of the item.
- `item`: The item to insert or update.
- `sk` (optional): The sort key of the item.

### deleteOne(tableName: string, pk: string, pkValue: string): Promise\<void\>

Deletes one item by partition key.

- `tableName`: The name of the table.
- `pk`: The partition key of the item to be deleted.
- `pkValue`: The value of the partition key.

### findOne(tableName: string, pk: string, pkValue: string): Promise\<any | null\>

Finds one item by partition key.

- `tableName`: The name of the table.
- `pk`: The partition key of the item to be found.
- `pkValue`: The value of the partition key.

Returns `null` if the item is not found.

### findMany(tableName: string, pk: string, pkValue: string): Promise\<any[]\>

Finds many items by partition key.

- `tableName`: The name of the table.
- `pk`: The partition key of the items to be found.
- `pkValue`: The value of the partition key.

Returns an array of items.

### findManyByField(tableName: string, field: string, value: any): Promise\<any[]\>

Finds many items by field key.

- `tableName`: The name of the table.
- `field`: The field key of the items to be found.
- `value`: The value of the field.

Returns an array of items.

### findManyPlain(tableName: string, filterExpression: string, expressionAttributeValues: Record<string, AttributeValue>): Promise\<any[]\>

Finds many items using a plain DynamoDB expression.

- `tableName`: The name of the table.
- `filterExpression`: The filter expression.
- `expressionAttributeValues`: The expression attribute values.

Returns an array of items.

### findOperated(tableName: string, filter: any, operators: { [key: string]: '<' | '<=' | '=' | '>=' | '>' }): Promise\<any[]\>

Finds items using operated filters.

- `tableName`: The name of the table.
- `filter`: The attributes to be searched and their values in an object.
- `operators`: The operators for each attribute in an object.

Returns an array of items.

### findWithin(tableName: string, key: string, start: number, end: number): Promise\<any[]\>

Finds items within a range.

- `tableName`: The name of the table.
- `key`: The key to filter within.
- `start`: The start value of the range.
- `end`: The end value of the range.

Returns an array of items.

### findAll(tableName: string, limit: number = 10): AsyncGenerator<Record<string, any>[], void, unknown>

Findsall items in the table.

- `tableName`: The name of the table.
- `limit`: The maximum number of items to retrieve per batch (default is 10).

Returns an async iterable that yields batches of items. Each batch is an array of items.

## Conclusion

express-dynamodb is a useful package for simplifying the usage of DynamoDB in an Express.js application. It provides convenient functions for common operations and helps abstract away some of the complexity of working with DynamoDB. By using this package, you can easily perform CRUD operations on your DynamoDB tables and retrieve data based on different criteria.


Author: [@rrrokhtar](https://github.com/rrrokhtar)
