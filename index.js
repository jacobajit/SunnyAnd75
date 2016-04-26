var express = require('express');
var bodyParser = require('body-parser')
var request = require('request');
var app = express();


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
// parse application/json
app.use(bodyParser.json())



// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

//should be in an env file but will fix later
var token = "CAAGxhXrO5JwBAM1gmZBbRxsRWbZCe0eZBACErZCfGoiMu7kAkJgrOfTZCXy7NC3GD0nyH7QZCHuJsFyT6itq6zpNLdvzZCrnWX7H01uMue07vYmckJdb508376GfxAG3ohLUpfFJTwEcGBta83khobfHVjhzcz3JLQdAjrS7yrk47jrkMVKgW9AwVZCPpY20H48t79ZC5PIzeZBwZDZD";

function sendTextMessage(sender, text) {

  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

function getWeather(sender,city){
  reqUrl='http://api.openweathermap.org/data/2.5/weather?q='+city+'&units=imperial&appid=386285e93ccdb13044482fd7c4c95289'
  console.log("URL is: "+reqUrl)
  
  request({
    url: reqUrl,
    json:true,
    method: 'GET',

  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
    console.log(body)
    weather=body.main.temp;
    console.log(weather)
    sendTextMessage(sender, "It is currently "+ weather+" °F in "+city+".");
  });



}

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'voila') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
}) 

app.post('/webhook/', function (req, res) {
	console.log("test")

  messaging_events = req.body.entry[0].messaging;

  for (i = 0; i < messaging_events.length; i++) {

    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    console.log(event)
    if (event.message && event.message.text) {
      text = event.message.text;
      console.log(text)
      getWeather(sender,text)
      
    }
  }
  res.sendStatus(200);
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


