const express = require('express');
const app = express();
const cors = require('cors');
const Router=require('./src/routes/authRouter.js');
const roomRouter=require("./routes/roomRouter.js");
const guestRouter=require("./routes/guestRouter.js");
const bookingRouter=require("./routes/bookingRouter.js");

app.use(cors());

const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

app.use('/api/user',Router)

app.use("/api/room", roomRouter);
app.use("/api/guests", guestRouter);
app.use("/api/bookings", bookingRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
