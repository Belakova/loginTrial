const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const _ = require('lodash');
const cors = require('cors');

var app = express();
var http = require('http').Server(app);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));


app.use(cors());
app.settings = require('./settings');

//connect to mongodb

mongoose.connect(app.settings.dbhost);
mongoose.connection.once('open',function(){

  app.models = require ('./models/index');
  var routes = require('./routes');
  _.each(routes,function(controller,route){
    app.use(route,controller(app,route));
  })


  //start the Server
  http.listen(app.settings.port,function(){
    console.log("yay!" + app.settings.port);
  })

})
