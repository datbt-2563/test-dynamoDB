var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:8042",
});

var docClient = new AWS.DynamoDB.DocumentClient();

const workspaceId = 4;
const timesTest = 100;

const query = async () => {
  var params = {
    TableName: "aggregation_users",
    KeyConditionExpression: "#ws = :wsId",
    ExpressionAttributeNames: {
      "#ws": "workspaceId",
    },
    ExpressionAttributeValues: {
      ":wsId": workspaceId,
    },
  };

  var totalQueryResults = 0;
  var items;

  const startTime = Date.now();
  do {
    const startQuery = Date.now();
    items = await docClient.query(params).promise();
    console.log(
      `Got: ${items.Items.length} documents with execute time: ${
        Date.now() - startQuery
      }`
    );
    totalQueryResults += items.Items.length;
    params.ExclusiveStartKey = items.LastEvaluatedKey;
  } while (typeof items.LastEvaluatedKey !== "undefined");

  const executeTime = Date.now() - startTime;

  console.log(
    `Got total: ${totalQueryResults} items with execute time: ${executeTime}`
  );

  return {
    count: totalQueryResults,
    time: executeTime,
  };
};

(async () => {
  const results = [];
  for (let index = 0; index < timesTest; index++) {
    console.log(`Start times ${index}:`);
    const res = await query();
    results.push(res);
    console.log("End\n");
  }

  console.log(results);
  var sum = 0;
  results.map((m) => {
    sum += m.time;
  });

  console.log(sum);
  console.log(sum / timesTest);
})();
