const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const uuid = require('uuid/v1');
const mailchimpApi = require('mailchimp-api-v3');
const request = require('request');
var bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 10;

module.exports = (app, route) => {
    var User = mongoose.model('user', app.models.user);

    // setup mailchimp
    var mailchimp = new mailchimpApi(app.settings.mailchimp_api);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'trial.nodemail@gmail.com',
            pass: 'trialnode'
        }
    });
  
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Trial 👻" <trial.nodemail@gmail.com>', // sender address
        to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
        subject: 'Account activation', // Subject line
        text: 'Please click on this link to activate your account: ' // plain text body
        //html: '<b>Hello world ?</b>' // html body
    };


    /** Get all users **/
    app.get('/user', (req, res) => {
        res.status("200").send("This is the /user GET route");
    });

    /** Get single user **/
    app.get('/user/:id', (req, res) => {

    });

    /** Activate account **/
    app.get('/user/:id/activate', (req, res) => {
      if (!req.query.activation_token) return res.status(400).send("No activation token present in the request.");

      User.findOne({
        _id: req.params.id
      }, (err, user) => {
        if (err) return res.status(400).send(err);
        if (!user || user.length < 1) return res.status(400).send(user);

        if(req.query.activation_token == user.activationToken) {
          user.isValid = true;
        }

        user.save((err) => {
          if (err) return res.status(400).send(err);

          var mailchimpOpt = {
            id: "5318b9a77b",
            email: {
              email: user.email
            },
            merge_vars: {
              EMAIL: user.email,
              FNAME: "TRIAL",
              LNAME: ""
            }
          };

          console.log("Email: " + user.email);

          request({
            url: "https://"+ app.settings.mailchimp_api.split('-')[1]+".api.mailchimp.com/3.0/lists/5318b9a77b/members",
            method: 'POST',
            auth: {
              user: "hey",
              password: app.settings.mailchimp_api
            },
            body: JSON.stringify({
                email_address: user.email,
                status: "subscribed"
            }),
            headers : {
              'Content-Type': "application/json",
              'Accept': "application/json"
            }
          }, (error, resp, body) => {
            if (error) {
              console.log(error);
              return res.status(400).send(error);
            }

            return res.status(resp.statusCode).send(body);
          });
        });
      });
    });

    /** Create a new account **/
    app.post('/user', (req, res) => {


        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            bcrypt.hash(req.body.password, salt, null, function(err, hash) {
                if (err) return next(err);
                req.body.password = hash;
                // temporary - app.post below
                req.body.activationToken = uuid();

                User.collection.insert(req.body, function(error, user) {
                    if (error) return res.status(400).send(error);

                    mailOptions.text += app.settings.host + "/user/" + user.ops[0]._id + "/activate?activation_token=" + req.body.activationToken + "&user_id=" + user.ops[0]._id;
                    mailOptions.to = user.ops[0].email;
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                          console.log(user);
                            return res.status(400).send(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        return res.status(200).send(user.ops[0]);
                    });
                });
                // ----
                // next();
            });
        });

        //res.status("200").send("This is the /user GET route");
    });

    return (req, res, next) => {
        next();
    }
}
