/**
 * Created by mk on 25.2.2016.
 */

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

var app = express();

app.use(bodyParser.json());
app.use(passport.initialize());

passport.serializeUser(function (user, done) {
    done(null,user.Id);
});


passport.deserializeUser(function (id, done) {
    pool.getConnection(function (err,connection) {
        connection.query('Select * from User where id = ?', function (err,rows) {
            done(err,rows[0]);
        });
    });
});


app.use(function (req,res,next) {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers','Content-Type,Authorization');

    next();
});

var pool = mysql.createPool({
    connectionLimit : 100,
    host     : '109.74.203.122',
    user     : 'mkdb',
    password : 'mA?16+db',
    database : 'rentflat'
});


var strategyOptions = {
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allow us to pass back the entire request to the callback
};



var registerStrategy = new LocalStrategy(strategyOptions, function (req,email,password,done) {
    //find a user whose email is the same as the forms email
    //we are checking to see if the user trying to login already exists
    pool.getConnection(function (err,connection) {
        connection.query('Select * from User where email = ?',[email], function (err,rows) {
            if(err) return done(err);
            if(rows.length){
                return done(null,false,{message:'Bu mail adresi sistemde kayıtlı.'});
            }else{
                //if there is no user with that username
                //create the user
                var newUser = {
                    email:email,
                    password : bcrypt.hashSync(password,null,null)
                };

                //daha sonra burada userCode oluşturulacak.

                var insertQuery = 'Insert into User(email,pass) values(?,?)';
                
                connection.query(insertQuery,[newUser.email,newUser.password], function (err,rows) {
                    if(err) done();
                    newUser.Id = rows.insertId;
                    connection.release();
                    return done(null,newUser);
                });

            }

        })
    });
});

var loginStrategy = new LocalStrategy(strategyOptions, function (req,email,password,done) {
    pool.getConnection(function (err,connection) {
        if(err) done(err);
        connection.query('Select * from User where email = ?',[email], function (err,rows) {
            if(err) done(err);
            if(!rows.length){
                return done(null,false,{message:'Kullanıcı sistemde kayıtlı değil'})
            }
            if(!bcrypt.compareSync(password,rows[0].pass)){
                return done(null,false,{message:'Şifre eşleşmiyor'});
            }
            return done(null,rows[0]);
        });
    });
});



passport.use('local-register',registerStrategy);
passport.use('local-login',loginStrategy);

app.post('/register',passport.authenticate('local-register'), function (req,res) {
    createSendToken(req.user, res);
});


app.post('/login',  passport.authenticate('local-login'), function (req,res) {
    createSendToken(req.user, res);
});


function createSendToken(user, res)
{
    var payload = {
        sub: user.Id
    }

    var token = jwt.encode(payload,'shh..');

    var sendUser = {
        "Id":user.Id,
        "email":user.email
    }
    res.status(200).send({
        user: sendUser,
        token: token
    });
}




app.post('/getFlat', function (req,res) {

    console.log(req.body.id);
    if(authenticate(req)) {
        var user = authenticate(req)
        pool.getConnection(function (err, connection) {
            connection.query('Select * from Flat where Id = ? and userId = ?', [req.body.id,user], function (err, rows) {
                if (err)throw err;
                connection.release();
                res.send(rows);
            });
        });
    }
});


app.post('/editFlat', function (req,res) {
    if(authenticate(req)){
        var user = authenticate(req);
        pool.getConnection(function (err,connection) {
            connection.query('Update Flat set flatName = ? , flatDescription= ? where Id = ? and userId = ?',[req.body.flatName,req.body.flatDescription,req.body.id,user], function (err,rows) {
                if(err)throw err;
                connection.release();
                return res.status(200).send();
            });
        });
    }
});



app.post('/getFlatsWithParam', function (req,res) {
    if(authenticate(req)){
        var user = authenticate(req)
        pool.getConnection(function (err,connection) {
            connection.query('Select Id, flatName, flatDescription from Flat where flatName like ? and userId = ? ',['%'+req.body.search+'%',user], function (err,rows) {
                if(err)throw err;
                connection.release();
                return res.send(rows);
            });
        });
    }else{
        res.status(401).send();
    }
});

app.get('/getFlats', function (req,res) {
    if(authenticate(req)){
        var user = authenticate(req)
        pool.getConnection(function (err,connection) {
            connection.query('Select Id, flatName, flatDescription from Flat where userId = ?',[user], function (err,rows) {
                if(err)throw err;
                connection.release();
                return res.send(rows);
            });
        });
    }else{
        res.status(401).send();
    }
});

app.post('/addFlat', function (req, res) {
    if(authenticate(req)){
        var user = authenticate(req);
        if(user != null){
            pool.getConnection(function (err,connection) {
                connection.query('insert into Flat (flatName,flatDescription,addDate,isActive,userId) values(?,?,?,?,?)',[req.body.flatName,req.body.flatDescription,new Date().toISOString().replace('T', ' ').substr(0, 10),1,[user]], function (err,rows) {
                    if(err)throw err;

                    connection.query('select * from Flat where Id = ?',[rows.insertId],function (err,result) {
                        if(err) throw err;
                        connection.release();
                        res.send(result[0]);
                    });

                });
            });
        }else{
            res.status(401).send();
        }
    }
});


app.post('/getRentals', function (req, res) {
    console.log(req.body);
    if(authenticate(req)){
        var user = authenticate(req);
        if(user != null){
            pool.getConnection(function (err,connection) {
                connection.query('Select rs.Id,rs.cFirstName,rs.cLastName,rs.customerPhone, rs.startDate, rs.endDate, rs.dailyPrice, rs.totalPrice, f.flatName from Reservation as rs join Flat as f on rs.flatId = f.Id  where rs.userId = ? order by Id desc',[user], function (err,rows) {
                    if(err)throw err;
                    connection.release();
                    res.send(rows);
                });
            });
        }else{
            res.status(401).send();
        }
    }
});



app.post('/addReservation', function (req,res) {
    if(authenticate(req)){
        var user = authenticate(req);
        if(user != null){
            pool.getConnection(function (err,connection) {
                connection.query('insert into Reservation (cFirstName,cLastName,customerPhone,startDate,endDate,dailyPrice,totalPrice,userId,flatId) values(?,?,?,?,?,?,?,?,?)',
                    [req.body.cFirstName,req.body.cLastName,req.body.cPhone,req.body.startDate,req.body.endDate,req.body.dailyPrice,req.body.totalPrice,user,req.body.flatId], function (err,rows) {
                    if(err)throw err;
                    connection.query('select * from Reservation where Id = ?',[rows.insertId],function (err,result) {
                        if(err) throw err;
                        connection.release();
                        res.send(result[0]);
                    });
                });
            });
        }else{
            res.status(401).send();
        }
    }
});


app.get('/getDash1', function (req,res) {
    if(authenticate(req)){
        var user = authenticate(req);


        if(user != null){
            pool.getConnection(function (err,connection) {
                connection.query('select count(*) as count from Reservation where userId = ?',
                    [user], function (err,rows) {
                        if(err)throw err;
                        var resCount = 0;
                        var resCiro = 0;
                        var maxDate = 0;
                        var flatCount = 0;
                        resCount = rows[0].count;
                        connection.query('SELECT sum(totalPrice) as total  from Reservation where userId = ?',
                            [user], function (err,rows) {
                                if(err)throw err;
                                resCiro = rows[0].total;

                                connection.query('select max(datediff(endDate,startdate)) as mxdt from Reservation where userId = ?',
                                    [user], function (err,rows) {
                                        if(err)throw err;
                                        maxDate = rows[0].mxdt;

                                        connection.query('select count(*) as flatCount from Flat where userId = ?',
                                            [user], function (err,rows) {
                                                if(err)throw err;
                                                flatCount = rows[0].flatCount;
                                                connection.release();
                                                res.send({"resCount":resCount,"resCiro":resCiro,"maxDate":maxDate,"flatCount":flatCount});

                                            });
                                    });
                            });

                    });
            });

        }else{
            res.status(401).send();
        }
    }
});




app.get('/jobs', function (req,res) {

    if(!req.headers.authorization){
        return res.status(401).send({message: 'You are not authorized'});
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token,"shh..");

    if(!payload.sub){
       return res.status(401).send({message: 'Authentication Failed'});
    }
    res.json(jobs);
});


function authenticate(req,res){
    if(!req.headers.authorization){
        return null;
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token,"shh..");

    if(!payload.sub){
        return null;
    }

    return payload.sub;
}


//mongoose.connect('mongodb://mkvgm:mn2016@109.74.203.122:27017/admin');

var server = app.listen(3000, function () {
    console.log('api listening on ', server.address().port);
});