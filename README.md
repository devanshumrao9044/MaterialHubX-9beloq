# Material Hub X - Educational Platform

A modern educational mobile application for IIT JEE / NEET / UPSC preparation with XP gamification, institute material hub, and comprehensive study features.

## 🎯 Features

### Student Features
- **Institute Selection**: Choose from PW, ALLEN, FIITJEE, MOTION, Material Hub, etc.
- **Batch Management**: Class-wise and exam-wise batch organization
- **Study Materials**: Access PDFs and study resources (app-only, no external downloads)
- **Test Series**: Practice tests with performance tracking
- **XP System**: Earn 1 XP every 2 minutes of active study time
- **Leaderboard**: Compare your progress with peers
- **Bookmarks & Downloads**: Save and download materials for offline access
- **Doubt Management**: Submit and track your academic doubts
- **Refer & Earn**: Invite friends and earn 100 XP per successful referral
- **Dark Mode**: Full light and dark theme support
- **Screen Protection**: Screenshot and screen recording protection

### Admin Features
- **Admin Panel**: Dedicated management dashboard
- **Batch Manager**: Create, edit, and delete batches
- **User Manager**: View, manage, and moderate users
- **Material Upload**: Add study materials and resources
- **Test Manager**: Create and manage test series
- **Analytics Dashboard**: Track total users, materials, tests, and downloads

## 🔐 Admin Access

**Admin Credentials:**
- Email: `admin@materialhubx.com`
- Password: Set during first sign-up

To access admin panel:
1. Login with admin credentials
2. Open side drawer (menu icon)
3. Click "Admin Panel"

## 📱 App Structure

### Main Tabs
- **Study**: Home screen with quick access and explore sections
- **Batches**: Coming soon
- **Quiz**: Battleground for practice tests
- **Store**: Premium content and features

### Quick Access Grid
- My Batches
- Battleground
- My Doubts
- My History
- Downloads
- Bookmarks

### Explore Section
- Test Series
- Library
- Leaderboard

## 🎨 Design

- **Color Scheme**: Purple (#6C63FF), Navy Blue (#2D3561), White
- **Theme**: Modern, clean Material Design
- **Typography**: Consistent hierarchy with bold headers
- **Icons**: Material Icons from @expo/vector-icons
- **Shadows**: Soft shadows for depth

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (file-based routing)
- **Backend**: OnSpace Cloud (Supabase-compatible)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Email-based authentication
- **Storage**: OnSpace Cloud Storage for PDFs and materials
- **State Management**: React Context API
- **Styling**: StyleSheet with design tokens

## 🗄️ Database Schema

### Tables
- `user_profiles`: Extended user data with XP tracking
- `institutes`: Available coaching institutes
- `batches`: Class and exam-wise batches
- `study_materials`: PDFs and study resources
- `tests`: Test series and quizzes
- `user_progress`: Session tracking and XP calculation
- `downloads`: Track user downloads
- `doubts`: Student doubt submissions
- `bookmarks`: Saved materials

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- Expo CLI installed globally
- OnSpace account (for backend)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on device:
   - Scan QR code with Expo Go app (iOS/Android)
   - Or press 'i' for iOS simulator
   - Or press 'a' for Android emulator

### First-Time Setup

1. **Create Admin Account**:
   - Sign up with `admin@materialhubx.com`
   - Set a secure password
   - This account will have admin privileges

2. **Select Institute**:
   - Choose your preferred institute (first login)
   - Default institutes are pre-populated

3. **Start Using**:
   - Explore study materials
   - Take practice tests
   - Earn XP by studying
   - Track your progress

## 📦 Building APK

### For Testing
```bash
# Download button in app header
Click "Download" → "Android APK"
```

### For Production
```bash
# Configure app signing
eas build --platform android

# Follow prompts for:
# - App bundle identifier
# - Keystore creation
# - Build type (APK/AAB)
```

## 🔧 Admin Panel Usage

### Add New Batch
1. Go to Admin Panel → Batches
2. Click "+" icon
3. Fill in batch details:
   - Name (e.g., "ARJUNA JEE 2026")
   - Class Level (e.g., "11th")
   - Exam Type (e.g., "IIT JEE")
   - Description (optional)
4. Click "Save"

### Manage Users
1. Go to Admin Panel → Users
2. Search for users
3. Actions available:
   - Reset Password
   - Ban User
   - View XP and activity

### Upload Materials
(Coming soon - requires Storage bucket setup)
1. Go to Admin Panel → Materials
2. Click "Upload"
3. Select PDF/Video
4. Assign to batch and subject
5. Publish

## 🎮 XP System

- **1 XP per 2 minutes** of active app usage
- Automatic tracking when app is in foreground
- Updates user profile in real-time
- Visible in leaderboard

## 📊 Leaderboard

- Ranks users by total XP
- Shows username and XP count
- Real-time updates
- Encourages healthy competition

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User can only access their own data
- Admin privileges checked server-side
- Screenshot protection enabled
- App-only PDF access (no external download links)

## 🎯 Roadmap

- [ ] Live class integration
- [ ] Video lectures
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] Offline mode
- [ ] Social features
- [ ] Payment integration for premium content

## 📄 License

Copyright © 2024 Material Hub X. All rights reserved.

## 📞 Support

For support or queries:
- Email: support@materialhubx.com
- In-app: Settings → Help & Support

---

**Made with ❤️ for students aspiring for IIT JEE, NEET, and UPSC**
