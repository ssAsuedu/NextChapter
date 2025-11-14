// server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Cognito Client Setup
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// ========================================
// MONGODB SCHEMAS
// ========================================

// User Schema
const userSchema = new mongoose.Schema({
  cognitoSub: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bookshelf: [{ type: String }], // Array of volumeIds
  friends: [{ type: String }], // Array of friend emails
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Friend Request Schema
const friendRequestSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true },
  receiverEmail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Progress Schema
const progressSchema = new mongoose.Schema({
  email: { type: String, required: true },
  volumeId: { type: String, required: true },
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  volumeId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Progress = mongoose.model('Progress', progressSchema);
const Review = mongoose.model('Review', reviewSchema);

// ========================================
// HELPER FUNCTIONS
// ========================================

// Get or create user from Cognito
const getOrCreateUser = async (email, name, cognitoSub) => {
  let user = await User.findOne({ email });
  
  if (!user) {
    user = new User({
      cognitoSub,
      email,
      name,
      bookshelf: [],
      friends: [],
    });
    await user.save();
    console.log(`Created new user: ${email}`);
  }
  
  return user;
};

// ========================================
// AUTHENTICATION ROUTES
// ========================================

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name, cognitoSub } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        cognitoSub: cognitoSub || `temp-${Date.now()}-${email}`, // Generate temp ID if no cognitoSub
        email,
        name,
        bookshelf: [],
        friends: [],
      });
      await user.save();
      console.log(`Created new user: ${email}`);
    }
    
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========================================
// USER ROUTES
// ========================================

// Get all users (excluding current user)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email name createdAt').sort({ name: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Search users by name or email
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    }, 'email name createdAt').limit(20);
    
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// ========================================
// FRIEND REQUEST ROUTES
// ========================================

// Send a friend request
app.post('/api/friends/request', async (req, res) => {
  try {
    const { senderEmail, receiverEmail } = req.body;
    
    // Validation
    if (!senderEmail || !receiverEmail) {
      return res.status(400).json({ error: 'Sender and receiver emails are required' });
    }
    
    if (senderEmail === receiverEmail) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    // Check if users exist
    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findOne({ email: receiverEmail });
    
    if (!sender || !receiver) {
      return res.status(404).json({ error: 'One or both users not found' });
    }
    
    // Check if already friends
    if (sender.friends.includes(receiverEmail)) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }
    
    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { senderEmail, receiverEmail, status: 'pending' },
        { senderEmail: receiverEmail, receiverEmail: senderEmail, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      // Check who sent the existing request
      if (existingRequest.senderEmail === senderEmail) {
        // User already sent a request to this person
        return res.status(400).json({ error: 'Request already sent' });
      } else {
        // The other person sent them a request (they should accept it instead)
        return res.status(400).json({ error: 'This user already sent you a friend request. Check your pending requests!' });
      }
    }
    
    // Create friend request
    const friendRequest = new FriendRequest({
      senderEmail,
      receiverEmail,
      status: 'pending',
    });
    
    await friendRequest.save();
    
    res.status(201).json({ 
      message: 'Friend request sent successfully', 
      request: friendRequest 
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Get pending friend requests (received)
app.get('/api/friends/requests/pending/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const requests = await FriendRequest.find({
      receiverEmail: email,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Populate sender information
    const requestsWithSenderInfo = await Promise.all(
      requests.map(async (request) => {
        const sender = await User.findOne({ email: request.senderEmail }, 'name email');
        return {
          ...request.toObject(),
          senderInfo: sender
        };
      })
    );
    
    res.status(200).json(requestsWithSenderInfo);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
});

// Get sent friend requests
app.get('/api/friends/requests/sent/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const requests = await FriendRequest.find({
      senderEmail: email,
      status: 'pending'
    }).sort({ createdAt: -1 });
    
    // Populate receiver information
    const requestsWithReceiverInfo = await Promise.all(
      requests.map(async (request) => {
        const receiver = await User.findOne({ email: request.receiverEmail }, 'name email');
        return {
          ...request.toObject(),
          receiverInfo: receiver
        };
      })
    );
    
    res.status(200).json(requestsWithReceiverInfo);
  } catch (error) {
    console.error('Error fetching sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

// Accept friend request
app.post('/api/friends/request/accept', async (req, res) => {
  try {
    const { requestId, userEmail } = req.body;
    
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (request.receiverEmail !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is no longer pending' });
    }
    
    // Update request status
    request.status = 'accepted';
    request.updatedAt = new Date();
    await request.save();
    
    // Add each user to the other's friends list
    await User.updateOne(
      { email: request.senderEmail },
      { $addToSet: { friends: request.receiverEmail } }
    );
    
    await User.updateOne(
      { email: request.receiverEmail },
      { $addToSet: { friends: request.senderEmail } }
    );
    
    res.status(200).json({ 
      message: 'Friend request accepted', 
      request 
    });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Reject/Cancel friend request
app.post('/api/friends/request/reject', async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    request.status = 'rejected';
    request.updatedAt = new Date();
    await request.save();
    
    res.status(200).json({ 
      message: 'Friend request rejected', 
      request 
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ error: 'Failed to reject friend request' });
  }
});

// Get user's friends list
app.get('/api/friends/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get detailed info for each friend
    const friends = await User.find(
      { email: { $in: user.friends } },
      'email name createdAt'
    );
    
    res.status(200).json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Remove a friend
app.post('/api/friends/remove', async (req, res) => {
  try {
    const { userEmail, friendEmail } = req.body;
    
    // Remove from both users' friends lists
    await User.updateOne(
      { email: userEmail },
      { $pull: { friends: friendEmail } }
    );
    
    await User.updateOne(
      { email: friendEmail },
      { $pull: { friends: userEmail } }
    );
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Failed to remove friend' });
  }
});

// Check friendship status
app.get('/api/friends/status', async (req, res) => {
  try {
    const { userEmail, otherUserEmail } = req.query;
    
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if they're friends
    if (user.friends.includes(otherUserEmail)) {
      return res.status(200).json({ status: 'friends' });
    }
    
    // Check for pending request
    const pendingRequest = await FriendRequest.findOne({
      $or: [
        { senderEmail: userEmail, receiverEmail: otherUserEmail, status: 'pending' },
        { senderEmail: otherUserEmail, receiverEmail: userEmail, status: 'pending' }
      ]
    });
    
    if (pendingRequest) {
      if (pendingRequest.senderEmail === userEmail) {
        return res.status(200).json({ status: 'request_sent', requestId: pendingRequest._id });
      } else {
        return res.status(200).json({ status: 'request_received', requestId: pendingRequest._id });
      }
    }
    
    res.status(200).json({ status: 'none' });
  } catch (error) {
    console.error('Error checking friendship status:', error);
    res.status(500).json({ error: 'Failed to check friendship status' });
  }
});

// ========================================
// BOOKSHELF ROUTES
// ========================================

app.post('/api/bookshelf/add', async (req, res) => {
  try {
    const { email, volumeId } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.bookshelf.includes(volumeId)) {
      user.bookshelf.push(volumeId);
      await user.save();
    }
    
    res.status(200).json({ message: 'Book added to bookshelf', bookshelf: user.bookshelf });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

app.post('/api/bookshelf/delete', async (req, res) => {
  try {
    const { email, volumeId } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.bookshelf = user.bookshelf.filter(id => id !== volumeId);
    await user.save();
    
    res.status(200).json({ message: 'Book removed from bookshelf', bookshelf: user.bookshelf });
  } catch (error) {
    console.error('Error removing book:', error);
    res.status(500).json({ error: 'Failed to remove book' });
  }
});

app.get('/api/bookshelf/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.status(200).json({ bookshelf: user.bookshelf });
  } catch (error) {
    console.error('Error fetching bookshelf:', error);
    res.status(500).json({ error: 'Failed to fetch bookshelf' });
  }
});

// ========================================
// PROGRESS ROUTES
// ========================================

app.post('/api/progress/update', async (req, res) => {
  try {
    const { email, volumeId, currentPage, totalPages } = req.body;
    
    let progress = await Progress.findOne({ email, volumeId });
    
    if (progress) {
      progress.currentPage = currentPage;
      progress.totalPages = totalPages;
      progress.updatedAt = new Date();
    } else {
      progress = new Progress({ email, volumeId, currentPage, totalPages });
    }
    
    await progress.save();
    res.status(200).json({ message: 'Progress updated', progress });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

app.get('/api/progress/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const progress = await Progress.find({ email });
    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// ========================================
// REVIEW ROUTES
// ========================================

app.post('/api/reviews/add', async (req, res) => {
  try {
    const { email, name, volumeId, rating, reviewText } = req.body;
    
    const review = new Review({ email, name, volumeId, rating, reviewText });
    await review.save();
    
    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

app.get('/api/reviews/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const reviews = await Review.find({ email });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/reviews/book/:volumeId', async (req, res) => {
  try {
    const { volumeId } = req.params;
    const reviews = await Review.find({ volumeId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    res.status(500).json({ error: 'Failed to fetch book reviews' });
  }
});

// ========================================
// SERVER START
// ========================================

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});