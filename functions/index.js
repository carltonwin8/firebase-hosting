const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const express = require('express');
const engines = require('consolidate');
const app = express();
app.engine('ejs', engines.ejs);
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/timestamp', (req, res) => {
  res.send(`${Date.now()}`);
});

app.get('/timestamp-cached', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  res.send(`${Date.now()}`);
});


const firebase = require('firebase-admin');
const firebaseApp = firebase.initializeApp(functions.config().firebase);

let facts = { facts : [{
    text: 'the sky is blue'
  }, {
    text: 'the grass is green'
  }, {
    text: 'access to the database failed'
  }]};

function getFacts() {
  const ref = firebase.database().ref('facts');
  return ref.once('value').then(snap => snap.val());
}

app.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  getFacts()
    .then(facts => {
      console.log(facts);
      if (facts && facts[0].text) res.render('index', {facts : facts });
      else throw 'No information in database';
    })
    .catch(e => {
      console.error(e);
      res.render('index', facts );
    });
});

app.get('/facts.json', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  getFacts()
    .then(facts => {
      console.log(facts);
      if (facts && facts[0].text) res.json(facts);
      else throw 'No information in database';
    })
    .catch(e => {
      console.error(e);
      res.render('index', facts );
    });
});

exports.app = functions.https.onRequest(app);
