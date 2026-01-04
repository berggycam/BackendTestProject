require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const db = require('../src/config/db.js');
const {
    extensionQuery,
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

        await db.query(extensionQuery);
        console.log('✓ pgcrypto extension ensured');
        
        await db.query(userTable);
        console.log('✓ Users table created successfully');

        await db.query(studentTable);
        console.log('✓ Students table created successfully');

        await db.query(hostelTable);
        console.log('✓ Hostels table created successfully');

        await db.query(roomTable);
        console.log('✓ Rooms table created successfully');

        await db.query(bedTable);
        console.log('✓ Beds table created successfully');

        await db.query(roomAllocationTable);
        console.log('✓ Room allocation table created successfully');

        await db.query(feeTable);
        console.log('✓ Fees table created successfully');

        await db.query(paymentTable);
        console.log('✓ Payments table created successfully');

        await db.query(messTable);
        console.log('✓ Mess table created successfully');

        await db.query(menuTable);
        console.log('✓ Menu table created successfully');

        await db.query(messAttendanceTable);
        console.log('✓ Mess attendance table created successfully');

        await db.query(complaintTable);
        console.log('✓ Complaints table created successfully');

        await db.query(maintenanceTable);
        console.log('✓ Maintenance table created successfully');

        await db.query(visitorTable);
        console.log('✓ Visitors table created successfully');

        await db.query(studentAttendanceTable);
        console.log('✓ Student attendance table created successfully');

        await db.query(leaveRequestTable);
        console.log('✓ Leave requests table created successfully');

        await db.query(gateEntryTable);
        console.log('✓ Gate entry table created successfully');

        await db.query(auditLogTable);
        console.log('✓ Audit logs table created successfully');

        await db.query(guestTable);
        console.log('✓ Guest table created successfully');

        console.log('\n🎉 All hostel management tables created successfully!');
        console.log('Database is now ready for comprehensive hostel management operations.');
        
    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
        throw err;
    }
}

module.exports = {
    createTables
};

if (require.main === module) {
    createTables()
        .then(() => {
            console.log('\n✅ Table creation completed successfully.');
        })
        .catch((error) => {
            console.error('\n❌ Table creation failed:', error.message);
        })
        .finally(() => {
            db.end().catch((endErr) => {
                console.error('Error closing database pool:', endErr.message);
            });
        });
}
