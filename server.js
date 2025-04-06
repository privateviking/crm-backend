const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Replace <db_password> with your actual MongoDB password
mongoose.connect("mongodb+srv://crm:<1W@nker&2Hoes>@cluster0.ckuw5v9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Schemas
const userSchema = new mongoose.Schema({ email: String, password: String });
const contactSchema = new mongoose.Schema({
  fullName: String, email: String, phone: String, mobile: String,
  country: String, address: String, stockName: String, ticker: String,
  pricePerShare: Number, numberOfShares: Number, totalValue: String,
  assignedTo: String, notes: String, status: String
});
const messageSchema = new mongoose.Schema({
  from: String, to: String, text: String, timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Message = mongoose.model('Message', messageSchema);

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ success: false });
  const token = jwt.sign({ email }, "supersecuresecret");
  res.json({ success: true, user: { email }, token });
});

app.get('/api/contacts', async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

app.post('/api/contacts', async (req, res) => {
  const newContact = new Contact(req.body);
  await newContact.save();
  res.json({ success: true });
});

app.post('/api/messages', async (req, res) => {
  const { from, to, text } = req.body;
  const message = new Message({ from, to, text });
  await message.save();
  res.json({ success: true });
});

app.get('/api/messages', async (req, res) => {
  const { user } = req.query;
  const messages = await Message.find({ $or: [{ from: user }, { to: user }] }).sort({ timestamp: -1 });
  res.json(messages);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
