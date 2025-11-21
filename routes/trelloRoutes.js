// routes/trelloRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

const TRELLO_KEY = process.env.TRELLO_KEY || 
let TRELLO_TOKEN = process.env.TRELLO_TOKEN || "";

const TRELLO_API = "https://api.trello.com/1";

// Protect all routes
router.use(authMiddleware);

// -------------------------------
// 🔹 Test Trello Connection
// -------------------------------
router.get('/test', async (req, res) => {
  try {
    const response = await axios.get(`${TRELLO_API}/members/me`, {
      params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    res.json({
      success: true,
      connected: true,
      user: response.data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      connected: false,
      message: "Trello connection failed",
      error: err.message
    });
  }
});

// -------------------------------
// 🔹 Get User Boards
// -------------------------------
router.get('/boards', async (req, res) => {
  try {
    const response = await axios.get(`${TRELLO_API}/members/me/boards`, {
      params: { key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    res.json({
      success: true,
      boards: response.data.filter(b => !b.closed)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch boards",
      error: err.message
    });
  }
});

// -------------------------------
// 🔹 Create Board + Default Lists
// -------------------------------
router.post('/boards', async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create new board
    const boardRes = await axios.post(`${TRELLO_API}/boards/`, null, {
      params: {
        name,
        desc: description || "",
        key: TRELLO_KEY,
        token: TRELLO_TOKEN
      }
    });

    const board = boardRes.data;

    // Create default lists
    const defaultLists = ["To Do", "In Progress", "Review", "Completed"];
    for (let listName of defaultLists) {
      await axios.post(`${TRELLO_API}/lists`, null, {
        params: {
          name: listName,
          idBoard: board.id,
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      });
    }

    res.json({ success: true, board });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create board",
      error: err.message
    });
  }
});

// -------------------------------
// 🔹 Generate OAuth URL
// -------------------------------
router.get('/auth/url', (req, res) => {
  try {
    const returnUrl = `${process.env.BASE_URL || "http://localhost:5000"}/api/trello/callback`;

    const authUrl =
      `https://trello.com/1/authorize?return_url=${encodeURIComponent(returnUrl)}` +
      `&expiration=never&name=CingaApp&scope=read,write&response_type=token&key=${TRELLO_KEY}`;

    res.json({ success: true, authUrl });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to generate Trello auth URL",
      error: err.message
    });
  }
});

// -------------------------------
// 🔹 Receive & Save Trello Token
// -------------------------------
router.post('/auth/token', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "No token provided" });
  }

  TRELLO_TOKEN = token; // Save token in memory or db

  console.log("🔐 Trello token saved:", token);

  res.json({ success: true, message: "Token saved" });
});

// -------------------------------
// 🔹 Sync Project Tasks
// -------------------------------
router.post('/sync/project', async (req, res) => {
  try {
    const { projectId, tasks } = req.body;

    // Create board for project
    const boardRes = await axios.post(`${TRELLO_API}/boards`, null, {
      params: { name: `Project ${projectId}`, key: TRELLO_KEY, token: TRELLO_TOKEN }
    });

    const board = boardRes.data;

    // Create lists
    const lists = {
      todo: (await axios.post(`${TRELLO_API}/lists`, null, {
        params: { name: "To Do", idBoard: board.id, key: TRELLO_KEY, token: TRELLO_TOKEN }
      })).data,
      in_progress: (await axios.post(`${TRELLO_API}/lists`, null, {
        params: { name: "In Progress", idBoard: board.id, key: TRELLO_KEY, token: TRELLO_TOKEN }
      })).data,
      completed: (await axios.post(`${TRELLO_API}/lists`, null, {
        params: { name: "Completed", idBoard: board.id, key: TRELLO_KEY, token: TRELLO_TOKEN }
      })).data
    };

    // Add cards
    let count = 0;
    for (const task of tasks) {
      const targetList =
        task.status === "completed" ? lists.completed :
        task.status === "in_progress" ? lists.in_progress : lists.todo;

      await axios.post(`${TRELLO_API}/cards`, null, {
        params: {
          name: task.title,
          desc: task.description,
          idList: targetList.id,
          key: TRELLO_KEY,
          token: TRELLO_TOKEN
        }
      });

      count++;
    }

    res.json({
      success: true,
      synced: count,
      board
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to sync project",
      error: err.message
    });
  }
});

module.exports = router;
