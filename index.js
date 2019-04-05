const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const db = require('./data/dbConfig.js');

const server = express();

const sessionOptions = {
  name:'webauthi',
  secret: 'this is a secret',
  cookie: {
    maxAge: 1000* 60 * 60 * 2,
    secure: false
  },
  httpOnly: true,
  resave: false,
  saveUninitialized: false
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionOptions));

server.get('/', (req, res) => {
  res.send("Welcome!");
});

server.post('/api/register', (req, res) => {
  const user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;
  
  db.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  const user = req.body;

  db.get(user)
    .then(users => {
      if (user && bcrypt.compareSync(user.password, users.password)) {
        req.session.username = users[0].username
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', (req, res) => {
  if(req.session && req.session.username) {
  db.findBy()
    .then(users => {
      res.json(users);
    })
    .catch(err => { 
      res.send(err);
    })
  } else {
    res.status(400).json({message: 'cannot retrieve request'})
  }
});


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));