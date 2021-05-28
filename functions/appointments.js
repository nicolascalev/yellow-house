const query = require('../appointments.js')

exports.handler = async (event, context) => {
  try {
    var results = await query()
    return {
      statusCode: 200,
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err)
    };
  }
};