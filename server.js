//modules
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var env = require('dotenv').config();
const { time } = require('console');
const querystring = require('querystring');
const schedule = require('node-schedule');
const fs = require('fs');



const port = process.env.EXPOSEDPORT;
const servers = 3;

//using modules
app = express();
app.use(session({
	secret: process.env.SECRET,
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//This stores information relating to the connection to the database
var con = mysql.createConnection({  
  host: process.env.HOST,  
  user: 'root',  
  password: process.env.PASSWORD,
  port: process.env.MYSQL_LOCAL_PORT,
  database: process.env.DATABASE
});  

// var con = mysql.createConnection({  
//   host: "192.168.99.32",  
//   user: "root",  
//   password: "12345",
//   port: "3306",
//   database: "authentication"
//   });  


con.connect();


//None of these pages require authentication
app.get('/', (req,res) => {
  res.sendFile(__dirname+'/webpage/Visiting/home.html')

})

app.get('/about', (req,res) => {
  res.sendFile(__dirname+'/webpage/Visiting/about.html')
  req.session.loggedin = false;
})

app.get('/login', (req,res) => {
  res.sendFile(__dirname+'/webpage/Visiting/login.html')
  req.session.loggedin = false;
})

app.get('/denied', (req,res) => {
  res.sendFile(__dirname+'/webpage/Visiting/denied.html')

})

app.use('/images',express.static(__dirname + '/images'))

// This is the authentication function that receives info from the form
app.post('/auth', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

    con.query("USE authentication" , function (err, result) {
                if (err) throw err;
              });
    con.query("SELECT * FROM credentials WHERE username = ? AND password = ?", [username,password], function (err, result) {
      if (err) throw err;
    
      console.log("results: " + result )

    if (result.length > 0) {
      req.session.loggedin = true;
      req.session.username = username;
      console.log("authenticated")
      res.redirect('/access');
    } else {
      res.redirect('/denied');
    }			
    

  });

  });  




//all pages below this point require authentication
app.get('/access', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/access.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
})

app.get('/voted', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/voted.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
})

app.get('/novote', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/novote.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
})

app.get('/homeauth', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/homeauth.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/aboutauth', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/aboutauth.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/modpacks', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/modpacks.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/plugins', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/plugins.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/mods', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/mods.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/other', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/other.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

app.get('/vote', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/vote.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})

//this post is for voting, takes a single number as a vote parameter, serverside determines the rest from session
app.post('/data', (req,res) => {

  let vote = req.query.vote;
  if(!(vote)) {res.redirect('/denied');}
  
  if (req.session.loggedin) {

    console.log("You are logged in and can vote")
    
      
      con.query("INSERT INTO voting VALUES(? , CURRENT_TIME , IF(CURRENT_TIME > '12:55:00',DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), CURRENT_DATE), ?)", [req.session.username,req.query.vote], function (err, result) {
        if (err) { res.redirect('/novote') } else {res.sendFile(__dirname+'/webpage/Access/voted.html')}	
    }) 
    

	} else {
    console.log("Actually you cant vote")
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}

  
});


//This is the cron function that tallies the voes everyday at 12:55

const timetally = schedule.scheduleJob('55 12 * * *', function(){
  tally()
  

})

//seperate cron function and tally function so tally can be called multiple times when I want




var tally = function() {

  console.log("declared variables")
  var vote = 0;
 
  con.query("SELECT COUNT(username),vote FROM voting WHERE date = CURRENT_DATE  GROUP BY vote ORDER BY vote DESC", function (err, result) {
    console.log("Did query")
    if (err) {
      console.log(err)
    }

    try {
      vote = result[0].vote
    } catch (error) {
      vote = 1;
    }
  })
    
    console.log(vote)

    if (vote = 1) {
      var result = "data";
    } else {
      var result = "data" + vote;
    }

  


  fs.writeFileSync('/HOME/worlds',result, err => {

      if (err) {
          console.log("Error writing file");
      } else {
          console.log("File written successfully")
      }

  })


}


  




  
  






//listens for the server on the designated port 
app.listen(port, () => {
  console.log(`Example app listening at http://${process.env.HOST}:${port}`)
})


