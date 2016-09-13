var request = require('axios');

var bingApiKey = process.env.BING_SEARCH_KEY;
var queryUrl = 'https://api.cognitive.microsoft.com/bing/v5.0/search?q=:q&count=3';

function search(q) {
  var query = queryUrl.replace(':q', q);
  return request.get(query, {
    headers: {
      'Ocp-Apim-Subscription-Key': bingApiKey
    }
  })
  .then(parseResults)
}

function parseResults(response) {
  var results = response.data.webPages.value.map(function(r) {
    return {
      name: r.name,
      url: r.displayUrl,
      snippet: r.snippet
    };
  });
  return results;
}

exports.search = search;