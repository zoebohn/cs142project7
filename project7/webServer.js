"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
var async = require('async');


// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var PhotoSchemas = require('./schema/photo.js');
var Comment = PhotoSchemas.Comment;
var Photo = PhotoSchemas.Photo;
var SchemaInfo = require('./schema/schemaInfo.js');

var express = require('express');
var app = express();

var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/cs142project6');

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.count({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("Please login to use this feature.");
        return;
    }
    User.find({}, {_id:1, first_name:1, last_name:1}, function (err, users) {
        if (err) {
            response.status(500).send(JSON.stringify(err));
            return;
        }
        if (users.length === 0) {
            console.log('No users found');
        }
        // We got the object - return it in JSON format.
        response.end(JSON.stringify(users));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("Please login to use this feature.");
        return;
    }
    var id = request.params.id;
    User.findOne({_id:id}, {__v:0}, function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        // We got the object - return it in JSON format.
        response.end(JSON.stringify(user));
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("Please login to use this feature.");
        return;
    }
    var id = request.params.id;
    Photo.find({user_id:id}, {__v:0}, function (err, photosDB) {
        if (err) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (photosDB.length === 0) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        var photos = JSON.parse(JSON.stringify(photosDB));
        /* We have all photos, fill in user info */
        async.each(photos, function (photo, done_callback) {
            photo.date_time = (new Date(photo.date_time)).toLocaleString('iso', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second:'2-digit'});
            /* Get user info */    
            async.each(photo.comments, function (comment, comment_callback) {
                User.findOne({_id:comment.user_id}, {first_name:1, last_name:1}, 
                  function (err, user) {
                    if (err) {
                        comment_callback(err);
                        return;
                    }
                    if (user === null) {
                        console.log("No user with id: " + comment.user_id);
                        comment_callback('User for comment ' + comment._id + ' not found');
                        return;
                    }
                    comment.user = user;
                    comment.date_time = (new Date(comment.date_time)).toLocaleString('iso', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second:'2-digit'});
                    delete comment.user_id;
                    comment_callback(err);
                });
            }, function (err) {
                done_callback(err);
            });
            
        }, function (err) {
            if (err) {
                response.status(400).send(JSON.stringify(err));
            } else {
                response.end(JSON.stringify(photos));
            }
        });
    });
});

app.post('/commentsOfPhoto/:photo_id', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(401).send("Please login to use this feature.");
        return;
    }
    var photo_id = request.params.photo_id;
    var commentBody = request.body.comment;
    if (typeof commentBody === undefined || commentBody === "") {
        response.status(400).send("Error: empty comment.");
        return;
    }
    Photo.findOne({_id:photo_id}, {__v:0}, function (err, photo) {
        if (err) {
            response.status(400).send(JSON.stringify(err));
            return;
        } 
        var comments = JSON.parse(JSON.stringify(photo.comments)); 
        Comment.create({comment: commentBody, date_time: Date.now(), 
            user_id: request.session.user_id}, function (err, newComment) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
                return;
            }
            comments.push(newComment); 
            photo.comments = comments;
            photo.save(function(err, updatedPhoto) {
                if (err) {
                    response.status(500).send(JSON.stringify(err));
                    return;
                }
                response.end(JSON.stringify());
            });
        });

    }); 
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.post('/admin/login', function (request, response) {
    var login_name = request.body.login_name;
    User.findOne({login_name:login_name}, {first_name:1}, function (err, user) {
        if (err) {
            console.log('User with login name:' + login_name + ' not found.');
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with login name:' + login_name + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        request.session.loggedIn = true;
        request.session.user_id = user._id;
        // We got the object - return it in JSON format.
        response.end(JSON.stringify(user));
    });
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/admin/logout', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(400).send('Not currently logged in');
        return;
    }
    //TODO destroy session
    request.session.loggedIn = false;
    request.session.user_id = "";
    response.end();
});

/* Extra credit */
app.get('/admin/info', function (request, response) {
    if (!request.session.loggedIn) {
        response.status(400).send('Not currently logged in');
        return;
    }
    var id = request.session.user_id;
    User.findOne({_id:id}, {__v:0}, function (err, user) {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send(JSON.stringify(err));
            return;
        }
        if (user === null) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }
        // We got the object - return it in JSON format.
        response.end(JSON.stringify(user));
    });

});

var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


