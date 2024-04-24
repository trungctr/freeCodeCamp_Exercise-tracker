const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyPaser = require('body-parser');

const mongoose = require('mongoose')
const Exercises = require('./models/exer_model')
const Users = require('./models/user_model');

const uri = process.env.DB_URI
mongoose.connect(uri).then(() => {
  console.log('DB connect sucsess !')
}).catch((er) => { console.log(er) })


app.use(cors())
app.use(bodyPaser.urlencoded({ extended: false }));

app.use(express.static('public'))
app.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//[POST]/api/users
app.route('/api/users').post((req, res) => {
  let username = req.body.username
  let er = { error: 'invalid user name' }
  if (username) {
    Users({ username }).save().then((doc) => {
      res.json({ username: doc.username, _id: doc._id })
    })
      .catch(err => {
        if (err) {
          console.log('here', err)
          res.json(er)
        }
      })
  }
})
  //[GET]/api/users
  .get((req, res) => {
    Users.find().select({ __v: 0 })
      .then((docs) => {
        res.json(docs)
      }).catch(err => {
        if (err) {
          console.log('here', err)
          res.json(er)
        }
      })
  })



//[POST]/api/users/:_id/exercises
app.route('/api/users/:_id/exercises').post((req, res) => {
  let id = req.params._id
  let er1 = { error: 'invalid id' }
  let er2 = { error: 'add doc failed' }
  if (id) {
    Users.findById(id).then(user => {
      let getDate = Date.parse(req.body.date)
      let ex = {
        userId: id,
        username: String(user.username),
        description: req.body.description,
        duration: Number(req.body.duration),
        date: getDate ? getDate : new Date(Date.now()),
      }
      Exercises(ex).save().then((doc) => {
        res.json({
          username: user.username,
          description: doc.description,
          duration: doc.duration,
          date: new Date(doc.date).toDateString(),
          _id: id,
        })
      })
        .catch(err => {
          if (err) {
            console.log(err)
            res.json(er2)
          }
        })
    })
      .catch(err => {
        if (err) {
          console.log(err)
          res.json(er1)
        }
      }
      )
  }
})


//[GET]/api/users/:_id/logs?
app.route('/api/users/:_id/logs?').get((req, res) => {
  let url = req.url.split(req.path + "?")[1]
  let id = req.params._id
  let from = -1 * (2 ** 53)
  let to = 2 ** 53
  let limit;
  let er1 = { error: 'invalid id' }
  let er2 = { error: 'get logs failed' }
  if (url) {
    url = url.replaceAll('=', ",")
    url = url.replaceAll('&', ",")
    const urlParams = url.split(',')
    for (let i = 0; i < urlParams.length; i++) {
      if (urlParams[i] == "from") {
        from = Date.parse(urlParams[i + 1])
      }
      if (urlParams[i] == "to") {
        to = Date.parse(urlParams[i + 1])
      }
      if (urlParams[i] == "limit") {
        limit = Number(urlParams[i + 1])
      }
    }
  }
  if (id) {
    Users.findById(id).then(user => {
      Promise.allSettled([
        // editimg use from to ??? how make date to time stamp and check it
        Exercises.find({ userId: id, date: { $gte: from, $lte: to } }, { _id: 0, description: 1, duration: 1, date: 1 })
          .sort({ date: 1 }).limit(limit).lean(),
        Exercises.countDocuments({ userId: id })
      ]).then((data) => {
        let rawlogs = data[0].value
        let logs = []
        rawlogs.forEach(element => {
          element.date = new Date(element.date).toDateString()
          logs.push(element)
        });
        const record = {
          username: user.username,
          count: data[1].value,
          _id: id,
          log: logs
        }
        res.json(record)
      })
        .catch(err => {
          if (err) {
            console.log(err)
            res.json(er2)
          }
        })
    })
      .catch(err => {
        if (err) {
          console.log(err)
          res.json(er1)
        }
      }
      )
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
