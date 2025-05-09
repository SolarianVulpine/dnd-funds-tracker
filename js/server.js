// server.js
const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const { Storage } = require("@google-cloud/storage");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/User"); // Import the User model
const Party = require("./models/Party");
const Invite = require("./models/Invite");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Initialize Google Cloud Storage client
const storage = new Storage({
  keyFilename: "key.json", // Path to your service account key file
  projectId: "dnd-party-tracker", // Your Google Cloud project ID
});
const bucket = storage.bucket(process.env.STORAGE_BUCKET);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware for authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed" });
  }
};

// Authentication endpoint
app.post("/api/auth/login", async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Generate JWT for subsequent requests
    const jwtToken = jwt.sign(
      {
        sub: payload.sub,
        email: payload.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token: jwtToken });
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
  }
});

// Registration Endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Google OAuth Login (modified)
app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user
      user = new User({
        username: name,
        email,
        password: Math.random().toString(36).substring(7), // Generate a random password
      });
      await user.save();
    }

    // Create and assign a token
    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.json({ token: jwtToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Authentication failed" });
  }
});

// Create Party Endpoint
app.post("/api/party", authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    const party = new Party({
      name,
      owner: req.user._id,
    });
    await party.save();

    // Update the user's parties array
    req.user.parties.push(party._id);
    await req.user.save();

    res.status(201).json(party);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Party Endpoint (modified)
app.get("/api/party/:partyId", authenticate, async (req, res) => {
  try {
    const party = await Party.findById(req.params.partyId);

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Check if the user is the owner or a member of the party
    if (party.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(party);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Invite User Endpoint
app.post("/api/party/:partyId/invite", authenticate, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { inviteeEmail } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Check if the user is the owner of the party
    if (party.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if the invitee is already a member of the party
    const existingInvite = await Invite.findOne({
      party: partyId,
      inviteeEmail,
    });

    if (existingInvite) {
      return res.status(400).json({ message: "User already invited" });
    }

    const invite = new Invite({
      party: partyId,
      inviter: req.user._id,
      inviteeEmail,
    });

    await invite.save();

    party.invites.push(invite._id);
    await party.save();

    res.status(201).json(invite);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept Invite Endpoint
app.post(
  "/api/party/invite/:inviteId/accept",
  authenticate,
  async (req, res) => {
    try {
      const { inviteId } = req.params;

      const invite = await Invite.findById(inviteId);
      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }

      // Check if the invitee is the current user
      if (invite.inviteeEmail !== req.user.email) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      invite.status = "accepted";
      await invite.save();

      // Add the user to the party's members array
      const party = await Party.findById(invite.party);
      party.members.push({
        name: req.user.username, // Or a default name
        funds: {
          pp: 0,
          gp: 0,
          ep: 0,
          sp: 0,
          cp: 0,
        },
      });
      await party.save();

      res.json({ message: "Invite accepted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Deposit Funds Endpoint
app.post("/api/party/:partyId/deposit", authenticate, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { funds } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Check if the user is the owner or a member of the party
    if (party.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Add the funds to the party's group funds
    party.groupFunds.pp += funds.pp || 0;
    party.groupFunds.gp += funds.gp || 0;
    party.groupFunds.ep += funds.ep || 0;
    party.groupFunds.sp += funds.sp || 0;
    party.groupFunds.cp += funds.cp || 0;

    await party.save();

    res.json(party);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Withdraw Funds Endpoint
app.post("/api/party/:partyId/withdraw", authenticate, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { funds } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Check if the user is the owner or a member of the party
    if (party.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Subtract the funds from the party's group funds
    party.groupFunds.pp -= funds.pp || 0;
    party.groupFunds.gp -= funds.gp || 0;
    party.groupFunds.ep -= funds.ep || 0;
    party.groupFunds.sp -= funds.sp || 0;
    party.groupFunds.cp -= funds.cp || 0;

    await party.save();

    res.json(party);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Transfer Funds Endpoint
app.post("/api/party/:partyId/transfer", authenticate, async (req, res) => {
  try {
    const { partyId } = req.params;
    const { from, to, funds } = req.body;

    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    // Check if the user is the owner or a member of the party
    if (party.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Find the "from" and "to" members
    const fromMember = party.members.find((member) => member.name === from);
    const toMember = party.members.find((member) => member.name === to);

    if (!fromMember || !toMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Subtract the funds from the "from" member
    fromMember.funds.pp -= funds.pp || 0;
    fromMember.funds.gp -= funds.gp || 0;
    fromMember.funds.ep -= funds.ep || 0;
    fromMember.funds.sp -= funds.sp || 0;
    fromMember.funds.cp -= funds.cp || 0;

    // Add the funds to the "to" member
    toMember.funds.pp += funds.pp || 0;
    toMember.funds.gp += funds.gp || 0;
    toMember.funds.ep += funds.ep || 0;
    toMember.funds.sp += funds.sp || 0;
    toMember.funds.cp += funds.cp || 0;

    await party.save();

    res.json(party);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
