I will implement the account status verification to prevent banned users from logging in or re-registering.

### **1. Login Verification (`CustomerLogin.jsx`)**
I will modify the login flow to check the user's status immediately after authentication.
- **Action**: After successfully signing in and fetching the user's profile from the `customers` table, I will add a check for the `status` column.
- **Logic**:
  - If `status === 'banned'`, I will immediately force a `signOut()` to kill the session.
  - I will display a specific error message: *"Your account has been banned. Please contact support."*
  - If the status is active, the login proceeds as normal.

### **2. Registration Verification (`Register.jsx`)**
I will add a pre-check before creating a new account to ensure the email or contact number isn't associated with a banned account.
- **Action**: Before calling `signUp`, I will query the `customers` table for any existing record matching the provided `email` or `contact`.
- **Logic**:
  - If a record is found and its status is `banned`, I will block the registration and show: *"This account has been banned. You cannot register again."*
  - If the record exists but is not banned, the standard "Email already taken" error will apply.

### **Technical Implementation Steps**
1.  **Edit `src/components/auth/CustomerLogin.jsx`**: Insert the status check block inside the `handleSubmit` function after the profile query.
2.  **Edit `src/components/auth/Register.jsx`**: Insert a Supabase query inside `handleSubmit` to check for existing banned users by email or contact number before attempting registration.
