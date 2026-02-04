# Database Schema Reference (from deleted Backend)

## Admin
- fullname (String, required)
- email (String, required, unique)
- username (String, required, unique)
- password (String, required)
- role (String, default: "Admin")
- createdAt (Date, default: Date.now)

## Customer
- fullname (String, required)
- email (String, required, unique)
- username (String, required, unique)
- password (String, required)
- role (String, default: "Customer")
- contact (String, required)
- createdAt (Date, default: Date.now)

## Staff
- fullname (String, required)
- email (String, required, unique)
- username (String, required, unique)
- password (String, required)
- role (String, default: "Staff")
- createdAt (Date, default: Date.now)

## Event
- (File was empty in backend)
