const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");


router.get("/room", roomController.getRooms);            // Get all rooms
router.get("/room/:id", roomController.getRoomById);     // Get single room
router.post("/room/create", roomController.createRoom);  // Add new room

module.exports = router;
