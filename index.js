const express = require('express');
const app = express();
const admin = require('firebase-admin');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const ejs = require('ejs');
const bp = require('body-parser');
const bcrypt = require('bcrypt');
const https = require('https');

// Use the built-in 'https' module

// Replace with your Firebase Admin SDK configuration
const serviceAccount = require('./key.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = getFirestore();

app.use(bp.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Parse URL-encoded bodies
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});
app.get('/hlogin', (req, res) => {
  res.redirect('/login');
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', async (req, res) => {

  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);


  const querySnapshot = await admin.firestore().collection('students')
  .where('name', '==', username)
  .get();

// Check if there are any matching documents
if (!querySnapshot.empty) {
  querySnapshot.forEach((doc) => {
    // Access the data in each document
    const data = doc.data();

    // Access the 'password' field
    const password = data.password;

    console.log(`Username: ${username}, Password: ${password}`);
  });
} else {
  console.log('No documents matching the query');
}


  if (querySnapshot.empty) {

    return res.send('Invalid Credentials');
  }

  const userDoc = querySnapshot.docs[0];
  const storedHashedPassword = userDoc.data().password;

  // Use bcrypt.compareSync for synchronous comparison
  const passwordMatch = bcrypt.compareSync(password, storedHashedPassword);

  if (passwordMatch) {
    res.redirect('/CSP ZIP FILE/CSP/menu.html');
  } else {
    res.send('Invalid Credentials'); // Fixed typo here
  }

});
app.get('/hsignup', (req, res) => {
  res.redirect('/signup');
});

app.post('/signupsubmit', async (req, res) => {
  const name = req.body.username; // Change req.body.username to req.body.name
  const email = req.body.email;
  const password = req.body.password;

  if (!name || !email || !password) {
    res.send('All fields are required for signup.');
    return;
  }

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      res.send('Error while hashing password');
    } else {
      const userData = {
        name, // Use the correct field name
        email,
        password: hash,
      };

      db.collection('students') // Use the correct collection name
        .add(userData)
        .then(() => {
          res.send('Signup successful!');
        })
        .catch((error) => {
          res.send(`Error while signing up: ${error.message}`);
        });
    }
  });
});
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
