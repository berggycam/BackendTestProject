const express = require('express');
const app = express();
const pool=require('./src/config/db.js');
const cors = require('cors');
const Router=require('./src/routes/authRouter.js');
const roomRouter=require("./src/routes/roomRouter.js");
const guestRouter=require("./src/routes/guestRouter.js");
const superAdminRouter = require('./src/routes/superAdminRouter');
const adminRouter = require('./src/routes/adminRouter');
const staffRouter = require('./src/routes/staffRouter');
const bookingRouter=require("./src/routes/bookingRouter.js");
const paymentRouter=require("./src/routes/paymentRouter.js");

// New comprehensive hostel management routes
const studentRouter = require('./src/routes/studentRouter.js');
const hostelRouter = require('./src/routes/hostelRouter.js');
const roomAllocationRouter = require('./src/routes/roomAllocationRouter.js');
const feeRouter = require('./src/routes/feeRouter.js');
const complaintRouter = require('./src/routes/complaintRouter.js');
const visitorRouter = require('./src/routes/visitorRouter.js');


app.use(pool);
app.use(cors());

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hostel Management API is running');
});

// Middleware to parse JSON
app.use(express.json());

app.use('/api/user',Router);

app.use("/api/room", roomRouter);
app.use('/api/superadmin', superAdminRouter); // Full access superadmin
app.use('/api/admin', adminRouter);           // Superadmin manages admins
app.use('/api/staff', staffRouter);           // Admin manages staff
app.use('/api/guests', guestRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);

// New comprehensive hostel management routes
app.use('/api/students', studentRouter);
app.use('/api/hostels', hostelRouter);
app.use('/api/allocations', roomAllocationRouter);
app.use('/api/fees', feeRouter);
app.use('/api/complaints', complaintRouter);
app.use('/api/visitors', visitorRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
