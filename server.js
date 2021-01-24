const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const bodyParser = require('body-parser')
const mysql = require('mysql2')
const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(express.static(join(__dirname, "public")));
app.use(bodyParser.json())

var pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'manuja0712',
  database: 'companydatabase'
})

const homePageUrl = "https://www.w3schools.com";
const errorLanding = "http://localhost:3000/"

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get("/auth_config.json", urlencodedParser, (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/", urlencodedParser, (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/user", urlencodedParser, (req, res) => {
  //check user already in or not
  const uid = req.query.uid;

  var query = 'SELECT * from user_details WHERE id=?';

  pool.query(query, uid, function (err, rows) {
    if (err) {

      console.log("Error: " + err)
      console.log("Error occured in db query!!!")
      res.redirect(errorLanding)

    } else {

      if (rows.length!==0) {
        console.log('Exisiting user:'+uid)
        res.redirect(homePageUrl)
      } else {
        console.log('New user:'+uid)
        res.sendFile(join(__dirname, "user-details.html"));
      }
    }
  })

});

app.post('/add', urlencodedParser, function (req, res) {
  const aUid = req.query.uid;
  const mob = req.query.mob;

  var sql = "INSERT INTO user_details (id, mobile_number, name, email) VALUES (?, ?, ?, ?)";

  pool.query(sql, [aUid, mob, req.body.name, req.body.email], function (err, rows) {
    if (err) {
      console.log("Error: " + err)
      console.log("Cannot enter user to DB...!!!")
      res.redirect(errorLanding)
    } else {
      console.log('Record succesfully added')
      res.redirect(homePageUrl)
    }

    
  })

});

process.on("SIGINT", function () {
  process.exit();
});

module.exports = app;
