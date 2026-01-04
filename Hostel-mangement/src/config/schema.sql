
const extensionQuery = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
`;

const userTable = `
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('superAdmin','admin','warden','staff','student')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
    last_login TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const studentTable = `
CREATE TABLE IF NOT EXISTS students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    course VARCHAR(100) NOT NULL,
    year INT NOT NULL CHECK (year BETWEEN 1 AND 6),
    guardian_name VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
`;

const hostelTable = `
CREATE TABLE IF NOT EXISTS hostels (
    hostel_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_name VARCHAR(100) NOT NULL UNIQUE,
    hostel_type VARCHAR(10) NOT NULL CHECK (hostel_type IN ('boys', 'girls', 'co-ed')),
    address TEXT NOT NULL,
    warden_name VARCHAR(100) NOT NULL,
    warden_contact VARCHAR(20) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const roomTable = `
CREATE TABLE IF NOT EXISTS rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(10) NOT NULL CHECK (room_type IN ('single', 'double', 'triple')),
    capacity INT NOT NULL,
    rent NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'maintenance')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rooms_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE,
    CONSTRAINT uq_rooms_hostel_number UNIQUE (hostel_id, room_number)
);
`;

const bedTable = `
CREATE TABLE IF NOT EXISTS beds (
    bed_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    bed_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_beds_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT uq_beds_room_number UNIQUE (room_id, bed_number)
);
`;

const roomAllocationTable = `
CREATE TABLE IF NOT EXISTS room_allocation (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    room_id UUID NOT NULL,
    bed_id UUID NOT NULL,
    allocation_date DATE NOT NULL,
    vacate_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vacated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_allocation_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id) ON DELETE CASCADE,
    CONSTRAINT uq_allocation_student_active UNIQUE (student_id, status)
);
`;

const feeTable = `
CREATE TABLE IF NOT EXISTS fees (
    fee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_type VARCHAR(20) NOT NULL CHECK (fee_type IN ('hostel_rent', 'mess', 'security', 'other')),
    amount NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('monthly', 'semester', 'annual', 'one-time')),
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const paymentTable = `
CREATE TABLE IF NOT EXISTS payments (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    fee_id UUID NOT NULL,
    amount_paid NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('cash', 'online', 'bank_transfer', 'cheque')),
    transaction_id VARCHAR(100) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'failed')),
    remarks TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_fee FOREIGN KEY (fee_id) REFERENCES fees(fee_id) ON DELETE CASCADE
);
`;

const messTable = `
CREATE TABLE IF NOT EXISTS mess (
    mess_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL,
    mess_name VARCHAR(100) NOT NULL,
    mess_type VARCHAR(10) NOT NULL DEFAULT 'both' CHECK (mess_type IN ('veg', 'non-veg', 'both')),
    monthly_fee NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_mess_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(hostel_id) ON DELETE CASCADE
);
`;

const menuTable = `
CREATE TABLE IF NOT EXISTS menu (
    menu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mess_id UUID NOT NULL,
    day VARCHAR(10) NOT NULL CHECK (day IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    breakfast TEXT NULL,
    lunch TEXT NULL,
    dinner TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_menu_mess FOREIGN KEY (mess_id) REFERENCES mess(mess_id) ON DELETE CASCADE,
    CONSTRAINT uq_menu_mess_day UNIQUE (mess_id, day)
);
`;

const messAttendanceTable = `
CREATE TABLE IF NOT EXISTS mess_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_mess_attendance_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT uq_mess_attendance UNIQUE (student_id, date, meal_type)
);
`;

const complaintTable = `
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    complaint_type VARCHAR(20) NOT NULL CHECK (complaint_type IN ('electricity', 'water', 'cleaning', 'furniture', 'internet', 'other')),
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    resolved_by UUID NULL,
    resolved_at TIMESTAMPTZ NULL,
    resolution_remarks TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_complaint_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_complaint_resolver FOREIGN KEY (resolved_by) REFERENCES users(user_id) ON DELETE SET NULL
);
`;

const maintenanceTable = `
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    issue VARCHAR(200) NOT NULL,
    description TEXT NULL,
    reported_date DATE NOT NULL,
    resolved_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
    assigned_to UUID NULL,
    cost NUMERIC(10,2) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_maintenance_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT fk_maintenance_assignee FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL
);
`;

const visitorTable = `
CREATE TABLE IF NOT EXISTS visitors (
    visitor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    visitor_name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    visit_date DATE NOT NULL,
    in_time TIME NOT NULL,
    out_time TIME NULL,
    purpose VARCHAR(200) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_visitor_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
`;

const studentAttendanceTable = `
CREATE TABLE IF NOT EXISTS student_attendance (
    attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
    marked_by UUID NOT NULL,
    remarks TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_student_attendance_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_attendance_marker FOREIGN KEY (marked_by) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_student_attendance UNIQUE (student_id, date)
);
`;

const leaveRequestTable = `
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID NULL,
    approved_at TIMESTAMPTZ NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_leave_request_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_leave_request_approver FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL
);
`;

const gateEntryTable = `
CREATE TABLE IF NOT EXISTS gate_entry (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    date DATE NOT NULL,
    in_time TIME NULL,
    out_time TIME NULL,
    purpose VARCHAR(200) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_gate_entry_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);
`;

const auditLogTable = `
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NULL,
    record_id UUID NULL,
    old_values JSONB NULL,
    new_values JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
`;

const guestTable = `
CREATE TABLE IF NOT EXISTS guests (
    guest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    purpose VARCHAR(200) NULL,
    visit_date DATE NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

module.exports = {
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
};