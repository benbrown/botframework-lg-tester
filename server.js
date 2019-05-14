// server.js
// where your node app starts

// init project
const express = require('express');
const app = express();
var hbs = require('express-hbs');
const fs = require('fs');


app.engine('hbs', hbs.express4({
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

const {TemplateEngine} = require('botbuilder-lg');
// let engine = TemplateEngine.fromFiles(__dirname + '/language/greetings.lg');

let default_lg = fs.readFileSync('language/defaults.lg','utf8');
let default_json = JSON.parse(fs.readFileSync('./language/json.json', 'utf8'));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use(function(req, res, next) { 
  console.log('> ', req.url);
  next();
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(req, res) {
  let query = {
      lg: default_lg,
      text: 'order',
      freetext: '',
      iterations: 3,
      json: JSON.stringify(default_json, null, 2),
     ...req.query 
  }
  
  let results = [];
  try {
    query.data = JSON.parse(query.json);
    let engine = TemplateEngine.fromText(query.lg);
    for (var x = 0; x < query.iterations; x++) {
      // first evaluate this as a template
      let text;
      if (query.text) {
        text = engine.evaluateTemplate(query.text, query.data);
      } else {
          text = engine.evaluate(query.freetext, query.data);
      }
      // text = engine.evaluate(text, query.data);
      results.push(text);
    }
  } catch(err) {
     // console.error(err); 
    query.error = err;
  }
  query.results = results;
  query.pretty_json = JSON.stringify(query.data, null, 2);
  res.render('index', query);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
