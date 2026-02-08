# 🔐 Material Hub X - Admin Access Guide

## Admin Login Credentials

### **IMPORTANT: First-Time Setup Required**

The admin account **MUST be created first** before you can login.

### Step 1: Create Admin Account (SIGN UP)

1. Open the app
2. Click **"Sign Up"** button on login screen
3. Fill in the following details:
   - **Username**: `Admin` (or any name you prefer)
   - **Email**: `admin@materialhubx.com`
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Confirm Password**: Re-enter the same password
4. Click **"Sign Up"**
5. Wait for "Account created successfully!" message

### Step 2: Login as Admin

1. Now click **"Sign In"** button
2. Enter credentials:
   - **Email**: `admin@materialhubx.com`
   - **Password**: The password you set in Step 1
3. Click **"Sign In"**

### Step 3: Access Admin Panel

1. After login, you'll see the home screen
2. Click the **menu icon** (☰) in top-left corner
3. In the drawer menu, click **"Admin Panel"**
4. You now have full admin access!

---

## Admin Features Available

### ✅ Dashboard
- View total users, materials, tests, downloads
- Quick statistics overview

### ✅ Batch Management
- Create new batches (e.g., "ARJUNA JEE 2026")
- Edit batch details
- Delete batches
- Assign class level and exam type

### ✅ User Management
- View all registered users
- Search users by email/username
- Reset user passwords (feature placeholder)
- Ban/suspend users (feature placeholder)
- View user XP and activity

### ✅ Material Management (Coming Soon)
- Upload PDFs and study materials
- Organize by batch and subject
- Set visibility and access controls

### ✅ Test Management (Coming Soon)
- Create MCQ tests
- Set duration and marks
- View test analytics

---

## Important Notes

⚠️ **Common Login Errors**

**Error: "Invalid credentials"**
- **Cause**: Trying to login without creating account first
- **Solution**: Use "Sign Up" button to create the admin account first

**Error: "Email already registered"**
- **Cause**: Admin account already exists
- **Solution**: Use "Sign In" button with the password you set

**Forgot Password?**
- Currently password reset requires backend edge function
- Recommended: Remember your password or recreate account if needed

---

## Default Test Credentials (For Testing)

If you want to create a test student account:

**Student Account:**
- Email: `student@test.com`
- Password: `123456`
- Username: `TestStudent`

(Create via Sign Up, same process as admin)

---

## Security

- Admin detection is based on email: `admin@materialhubx.com`
- Only this specific email has admin panel access
- All other emails are regular student accounts
- Row Level Security (RLS) is enabled on database

---

## Troubleshooting

**Q: I created admin account but can't see Admin Panel in drawer**
- Make sure you signed up with exactly: `admin@materialhubx.com`
- Check for typos in email
- Try logging out and logging back in

**Q: "Please fill all required fields" error**
- Make sure all fields are filled during sign up:
  - Username ✓
  - Email ✓
  - Password ✓
  - Confirm Password ✓

**Q: Getting "invalid credentials" even with correct password**
- Close app completely and reopen
- Check Backend connection status
- Verify internet connection

---

## Need Help?

If you continue to face issues:
1. Check that OnSpace Cloud backend is connected
2. Verify internet connection
3. Try logging in from a fresh app restart
4. Check console logs for detailed error messages

**Support**: For further assistance, check the app's Help & Support section or contact the development team.
