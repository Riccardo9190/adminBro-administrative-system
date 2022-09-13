require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 8080;

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const AdminBro = require('admin-bro');
const AdminBroExpressjs = require('admin-bro-expressjs');
AdminBro.registerAdapter(require('admin-bro-mongoose'));


// -------- Express config --------
const app = express();
app.use(bodyParser.json());


// -------- Mongoose models --------
const User = mongoose.model('User', { name: String, email: String, surname: String });

var articleSchema = new mongoose.Schema({
  title: String,
  body: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: { type: Date, default: Date.now }
});

const Article = mongoose.model('Article', articleSchema);


// -------- Express routes --------
app.get('/', (req, res) => res.send('Hello World!'));

app.get('/users', async (req, res) => {
  const users = await User.find({}).limit(10) // Returns the last 10 users from the database.
  res.send(users)
});

app.post('/users', async (req, res) => {
  const user = await new User(req.body.user).save()
  res.send(user)
});

app.get('/articles', async (req, res) => {
  const articles = await Article.find({}).limit(10) // Returns the last 10 articles from the database.
  res.send(articles)
});


// -------- AdminBro resources parents definitions --------
const createParent = {
  name: 'Create'
};

const managerParent = {
  name: 'Manage'
};


// -------- AdminBro settings --------
const adminBro = new AdminBro({
  rootPath: '/admin',
  resources: [
    {
      resource: User, options: { parent: managerParent }
    },
    {
      resource: Article, options: {
        properties: {
          body: { type: 'richtext' },
          created_at: { isVisible: { list: false, filter: false, show: true, edit: false } }
        },
        parent: createParent
      }
    }
  ],
  branding: {
    companyName: 'AdminBro',
    softwareBrothers: true
  }
});


// -------- AdminBro route to handle all express routes --------
const router = AdminBroExpressjs.buildRouter(adminBro);
app.use(adminBro.options.rootPath, router);

const run = () => {
  mongoose.connect(MONGO_URL)
  app.listen(PORT, () => {
    console.log(`Administrative System AdminBro in the air!`)
  })
};

run();