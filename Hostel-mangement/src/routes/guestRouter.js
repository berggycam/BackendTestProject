const express = require("express");
const router = express.Router();
const  guestController= require("../controllers/guestController");

//Crud
router.get("/", guestController.getGuests);            
router.get("/:id", guestController.getGuestById);     
router.post("/create", guestController.createGuest);  
router.put('/update/:id', guestController.updateGuest);
router.delete('/delete/:id', guestController.deleteGuest);


module.exports = router;