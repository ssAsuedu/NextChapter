import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";
import User from "./models/User.js"; // Import the User model
import Review from "./models/Review.js";
import FriendRequest from "./models/FriendRequest.js";
import List from "./models/List.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Cognito Configuration
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID, // Replace with your User Pool ID
  ClientId: process.env.COGNITO_APP_CLIENT_ID,  // Replace with your App Client ID
};
const userPool = new CognitoUserPool(poolData);

// Sign-Up Route
app.post("/api/signup", (req, res) => {
  const { email, password, name } = req.body;

  const attributeList = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
    new CognitoUserAttribute({ Name: "name", Value: name }),
  ];

  userPool.signUp(email, password, attributeList, null, async (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Add the user to MongoDB and give the NewChapter badge
      const newUser = new User({
        name,
        email,
        badges: [{ type: "NEW_CHAPTER" }],
      });
      await newUser.save();

      res.json({ message: "Sign-up successful and user added to database", user: result.user });
    } catch (dbError) {
      console.error("Error saving user to database:", dbError);
      res.status(500).json({ error: "Failed to save user to database" });
    }
  });
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  user.authenticateUser(authDetails, {
    onSuccess: async (result) => {
      const accessToken = result.getAccessToken().getJwtToken();

      // Optional: Fetch user info from MongoDB
      let userInfo = null;
      try {
        userInfo = await User.findOne({ email });
      } catch (dbError) {
        console.error("Error retrieving user from database:", dbError);
      }

      res.json({
        message: "Login successful",
        token: accessToken,
        user: userInfo, // This can be null if not found
      });
    },
    onFailure: (err) => {
      console.error("Login error:", err);
      res.status(401).json({ error: err.message || "Login failed" });
    },
  });
});

// Confirm Registration Route
app.post("/api/confirm", (req, res) => {
  const { email, code } = req.body;

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  user.confirmRegistration(code, true, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ message: "Email confirmed successfully!", result });
  });
});

// Add book to user's bookshelf
app.post("/api/bookshelf/add", async (req, res) => {
  const { email, volumeId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.bookshelf.includes(volumeId)) {
      user.bookshelf.push(volumeId);
      // if user has more than 20 books in shelf, then they earn the future librarian badge 
      if (user.bookshelf.length >= 20) {
        const alreadyHas = (user.badges || []).some(
          (b) => b.type === "FUTURE_LIBRARIAN"
        );

        if (!alreadyHas) {
          user.badges = user.badges || [];
          user.badges.push({
            type: "FUTURE_LIBRARIAN",
            earnedAt: new Date(),
          });
        }
      }
      await user.save();
    }
    res.json({ message: "Book added to bookshelf", bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to add book" });
  }
});

// Delete book from user's bookshelf
app.post("/api/bookshelf/delete", async (req, res) => {
  const { email, volumeId } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    user.bookshelf = user.bookshelf.filter(id => id !== volumeId);
    await user.save();
    res.json({ message: "Book removed from bookshelf", bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove book" });
  }
});

// Get user's bookshelf
app.get("/api/bookshelf/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ bookshelf: user.bookshelf });
  } catch (err) {
    res.status(500).json({ error: "Failed to get bookshelf" });
  }
});

// Create a new list
app.post("/api/lists", async (req, res) => {
    const { email, name, privacy, books } = req.body;
  
    if (!email || !name) {
      return res.status(400).json({ error: "Email and list name are required" });
    }
  
    try {
      const newList = new List({
        email,
        name,
        privacy: privacy || "private",
        books: books || []
      });
  
      await newList.save();
  
      res.status(201).json({ message: "List created successfully", list: newList });
    } catch (err) {
      console.error("Create list error:", err);
      res.status(500).json({ error: "Failed to create list" });
    }
  });
  
  // Edit a list
  app.post("/api/lists/edit", async (req, res) => {
    const { email, listId, name, privacy, books } = req.body;
  
    try {
      const list = await List.findOne({ _id: listId, email });
  
      if (!list) {
        return res.status(404).json({ error: "List not found for this user" });
      }
  
      if (name !== undefined) list.name = name;
      if (privacy !== undefined) list.privacy = privacy;
      if (books !== undefined) list.books = books;
  
      await list.save();
  
      res.json({
        message: "List updated successfully",
        list
      });
  
    } catch (err) {
      console.error("Edit list error:", err);
      res.status(500).json({ error: "Failed to edit list" });
    }
  });
  
  // Delete a list
  app.delete("/api/lists/:id", async (req, res) => {
    try {
      const deletedList = await List.findByIdAndDelete(req.params.id);
  
      if (!deletedList) {
        return res.status(404).json({ error: "List not found" });
      }
  
      res.json({ message: "List deleted successfully" });
    } catch (err) {
      console.error("Delete list error:", err);
      res.status(500).json({ error: "Failed to delete list" });
    }
  });
  
  // Get all lists for a user
  app.get("/api/lists/:email", async (req, res) => {
    try {
      const lists = await List.find({ email: req.params.email }).sort({ createdAt: -1 });
      res.json(lists);
    } catch (err) {
      console.error("Fetch lists error:", err);
      res.status(500).json({ error: "Failed to fetch lists" });
    }
  });

// Get progress for all books
app.get("/api/progress/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ progress: user.progress || [] });
});

// Update progress for a book
app.post("/api/progress/update", async (req, res) => {
  const { email, volumeId, currentPage, totalPages } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const safeTotal = Math.max(0, Number(totalPages) || 0);
  const safeCurrent = Math.max(0, Math.min(Number(currentPage) || 0, safeTotal));

  const idx = user.progress.findIndex((p) => p.volumeId === volumeId);
  if (idx > -1) {
    user.progress[idx].currentPage = currentPage;
    user.progress[idx].totalPages = totalPages;
  } else {
    user.progress.push({ volumeId, currentPage, totalPages });
  }
  // logic for the badges earend based on user progress are being handled here 
  // below handles the logic for the halfway badge (it is limited to one halfway badge per book)
  const percent = safeTotal > 0 ? safeCurrent / safeTotal : 0;

  if (percent >= 0.5) {
    const alreadyHas = (user.badges || []).some(
      (b) => b.type === "HALFWAY" && b.volumeId === volumeId
    );

    if (!alreadyHas) {
      user.badges = user.badges || [];
      user.badges.push({ type: "HALFWAY", volumeId, earnedAt: new Date() });
    }
  }
  // for finishing a book 
  if (safeTotal > 0 && safeCurrent >= safeTotal) {
    const alreadyFinished = (user.badges || []).some(
      (b) => b.type === "FINISHED" && b.volumeId === volumeId
    );

    if (!alreadyFinished) {
      user.badges = user.badges || [];
      user.badges.push({ type: "FINISHED", volumeId, earnedAt: new Date() });
    }
  }
  await user.save();
  res.json({ message: "Progress updated", progress: user.progress, badges: user.badges, });
});
// logic to get all of the badges accosiated with a user account  
app.get("/api/badges/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ badges: user.badges || [] });
});

app.get("/api/reviews/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ reviews: user.reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
});

app.post("/api/reviews/add", async (req, res) => {
  const { email, name, volumeId, rating, reviewText } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingReview = user.reviews.find(r => r.volumeId === volumeId);
    if (existingReview) {
      return res.status(400).json({ error: "You have already reviewed this book." });
    }

    user.reviews.push({ volumeId, rating, reviewText });

    // critic in the making badge check, if the user has posted 10 reviews or more 
    if ((user.reviews || []).length >= 10) {
      const alreadyHas = (user.badges || []).some(b => b.type === "CRITIC_IN_THE_MAKING");
      if (!alreadyHas) {
        user.badges = user.badges || [];
        user.badges.push({ type: "CRITIC_IN_THE_MAKING", earnedAt: new Date() });
      }
    }

    await user.save();

    const review = new Review({ email, name, volumeId, rating, reviewText });
    await review.save();
    res.json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Delete a review
app.post("/api/reviews/delete", async (req, res) => {
  const { email, volumeId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userReview = user.reviews.find(r => r.volumeId === volumeId);
    if (!userReview) return res.status(404).json({ error: "Review not found for this user" });

    user.reviews.pull(userReview._id);
    await user.save();

    await Review.findOneAndDelete({ email, volumeId });

    res.json({ message: "Review deleted successfully", reviews: user.reviews });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Edit a review
app.post("/api/reviews/edit", async (req, res) => {
  const { email, volumeId, rating, reviewText } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userReview = user.reviews.find(r => r.volumeId === volumeId);
    if (!userReview) return res.status(404).json({ error: "Review not found for this user" });

    userReview.rating = rating;
    userReview.reviewText = reviewText;
    userReview.updatedOn = Date.now();
    await user.save();

    await Review.findOneAndUpdate(
      { email, volumeId },
      { rating, reviewText, updatedOn: Date.now() }
    );

    res.json({ message: "Review updated successfully", reviews: user.reviews });
  } catch (err) {
    console.error("Edit review error:", err);
    res.status(500).json({ error: "Failed to edit review" });
  }
});

app.get("/api/reviews/book/:volumeId", async (req, res) => {
  try {
    const reviews = await Review.find({ volumeId: req.params.volumeId }).sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: "Failed to get reviews" });
  }
});


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

// Update user name
app.post('/api/users/update-name', async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Email and name required" });
  try {
    const user = await User.findOneAndUpdate({ email }, { name }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Name updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update name" });
  }
});

// Change password
app.post("/api/users/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Email, old password, and new password required" });
  }

  const user = new CognitoUser({
    Username: email,
    Pool: userPool,
  });

  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: oldPassword,
  });

  user.authenticateUser(authDetails, {
    onSuccess: () => {
      user.changePassword(oldPassword, newPassword, (err, result) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Password changed successfully" });
      });
    },
    onFailure: (err) => {
      res.status(401).json({ error: err.message || "Authentication failed" });
    },
  });
});

// ============ TRENDING BOOKS ROUTE ============

// Get trending books (most-added to bookshelves across all users)
app.get("/api/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;

    // Aggregate: unwind all users' bookshelves, count occurrences of each volumeId
    const trending = await User.aggregate([
      { $unwind: "$bookshelf" },
      { $group: { _id: "$bookshelf", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    // Return array of { volumeId, count }
    const results = trending.map((item) => ({
      volumeId: item._id,
      readers: item.count,
    }));

    res.json({ trending: results });
  } catch (err) {
    console.error("Error fetching trending books:", err);
    res.status(500).json({ error: "Failed to fetch trending books" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});