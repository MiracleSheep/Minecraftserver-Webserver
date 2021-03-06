//modules
var express = require('express');
var mysql = require('mysql2');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var env = require('dotenv').config();
const { time } = require('console');
const querystring = require('querystring');
const schedule = require('node-schedule');
const fs = require('fs');


const port = process.env.NODE_LOCAL_PORT;

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
var con = mysql.createPool({  
  host: process.env.MYSQL_HOST,  
  user: process.env.MYSQL_USERNAME,  
  password: process.env.MYSQL_ROOT_PASSWORD,
  port: process.env.MYSQL_LOCAL_PORT,
  database: process.env.MYSQL_DATABASE
});  






//None of these pages require authentication
app.get('/', (req,res) => {
  

  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/homeauth.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/home.html')
	}


})

app.get('/about', (req,res) => {

  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/aboutauth.html')
	} else {
    res.sendFile(__dirname+'/webpage/Visiting/about.html')
    req.session.loggedin = false;
	}
})

app.get('/login', (req,res) => {


  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/homeauth.html')
	} else {
    res.sendFile(__dirname+'/webpage/Visiting/login.html')
    req.session.loggedin = false;
	}

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
		res.sendFile(__dirname+'/webpage/Access/homeauth.html')
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



app.get('/history', (req,res) => {
  
  if (req.session.loggedin) {
    console.log("access granted")
		res.sendFile(__dirname+'/webpage/Access/history.html')
	} else {
		res.sendFile(__dirname+'/webpage/Visiting/denied.html');
	}
	

})


app.get('/nothingdangerous', (req,res) => {
  
		res.sendFile(__dirname+'/webpage/Visiting/spongebob.html')
})

app.get('/ip', (req,res) => {
  ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  res.json({ ip });
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
const job = schedule.scheduleJob('55 12 * * *', function(){
  console.log("Time functuion called")
  tally()
  

})



function tally() {

  var vote = 1;
  var result = "";
 
  con.query("SELECT COUNT(username) as total_votes,vote FROM voting WHERE date = CURRENT_DATE  GROUP BY vote ORDER BY total_votes DESC", function (err, result) {



    console.log("Did query")
    if (err) {
      console.log(err)
    }

    try {
      vote = result[0].vote
    } catch (error) {
      vote = 1;
    }

    console.log(vote)


    if (vote == 1) {
       result = "data";
    } else {
       result = "data" + (vote-1);
    }

    console.log(result);

    fs.writeFile(process.env.WORLD_PRINT, result, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");

    }); 

  }); 

  

}



//listens for the server on the designated port 
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


