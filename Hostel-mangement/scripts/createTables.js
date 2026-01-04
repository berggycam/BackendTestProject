require('dotenv').config();

const pool = require('../src/config/db.js');
const { 
    userTable, 
    studentTable,
    hostelTable,
    roomTable,
    bedTable,
    roomAllocationTable,
    feeTable,
    paymentTable,
    messTable,
    menuTable,
    messAttendanceTable,
    complaintTable,
    maintenanceTable,
    visitorTable,
    studentAttendanceTable,
    leaveRequestTable,
    gateEntryTable,
    auditLogTable,
    guestTable 
} = require('../src/config/schema.sql');

async function createTables() {
    try {
        console.log('Creating comprehensive hostel management database tables...');
        
        await pool.query(userTable);
        console.log('✓ Users table created successfully');

        await pool.query(studentTable);
        console.log('✓ Students table created successfully');

        await pool.query(hostelTable);
        console.log('✓ Hostels table created successfully');

        await pool.query(roomTable);
        console.log('✓ Rooms table created successfully');

        await pool.query(bedTable);
        console.log('✓ Beds table created successfully');

        await pool.query(roomAllocationTable);
        console.log('✓ Room allocation table created successfully');

        await pool.query(feeTable);
        console.log('✓ Fees table created successfully');

        await pool.query(paymentTable);
        console.log('✓ Payments table created successfully');

        await pool.query(messTable);
        console.log('✓ Mess table created successfully');

        await pool.query(menuTable);
        console.log('✓ Menu table created successfully');

        await pool.query(messAttendanceTable);
        console.log('✓ Mess attendance table created successfully');

        await pool.query(complaintTable);
        console.log('✓ Complaints table created successfully');

        await pool.query(maintenanceTable);
        console.log('✓ Maintenance table created successfully');

        await pool.query(visitorTable);
        console.log('✓ Visitors table created successfully');

        await pool.query(studentAttendanceTable);
        console.log('✓ Student attendance table created successfully');

        await pool.query(leaveRequestTable);
        console.log('✓ Leave requests table created successfully');

        await pool.query(gateEntryTable);
        console.log('✓ Gate entry table created successfully');

        await pool.query(auditLogTable);
        console.log('✓ Audit logs table created successfully');

        await pool.query(guestTable);
        console.log('✓ Guest table created successfully');

        console.log('\n🎉 All hostel management tables created successfully!');
        console.log('Database is now ready for comprehensive hostel management operations.');
        
    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
    } finally {
        await pool.end(); // close the connection
    }
}

module.exports = {
    createTables
};
