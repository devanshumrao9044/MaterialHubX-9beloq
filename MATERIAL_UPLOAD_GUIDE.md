# 📚 Material Upload & Management Guide

## For Admins: How to Upload Study Materials

### Step 1: Access Admin Panel
1. Login with admin credentials (`admin@materialhubx.com`)
2. Open side menu (☰ icon)
3. Click **"Admin Panel"**
4. Click **"Materials"** card

### Step 2: Upload a Material

1. Click the **"+"** button in top-right corner
2. **Choose File**: Click the dashed box to select file
   - Supported formats: **PDF, MP4, JPG, PNG**
   - Max size: **500MB**
3. **Select Batch**: Choose which batch can access this material (required)
4. **Enter Details**:
   - **Title**: Name of the material (required)
   - **Subject**: e.g., Physics, Chemistry, Math
   - **Chapter**: e.g., Thermodynamics, Organic Chemistry
   - **Description**: Brief explanation (optional)
5. Click **"Upload"** button
6. Wait for upload to complete

### Organizing Materials

**Best Practices:**
- Use clear, descriptive titles (e.g., "Physics Chapter 1 - Motion Notes")
- Always fill Subject and Chapter for better organization
- Group related materials under same subject/chapter
- Use consistent naming conventions

**Material Types:**
- 📕 **PDF**: Lecture notes, textbooks, question banks
- 🎥 **MP4**: Video lectures, recorded sessions
- 🖼️ **Images**: Diagrams, formulas, mind maps

### Managing Uploaded Materials

**View All Materials:**
- Materials are listed newest first
- Shows title, subject, chapter, file type

**Delete Material:**
- Click trash icon (🗑️) on any material
- Confirm deletion
- File is removed from storage and database

---

## For Students: How to Access Materials

### Step 1: Select Your Batch
1. From home screen, select your institute and batch
2. This determines which materials you can see

### Step 2: Browse Library
1. Go to **Library** from home screen or explore section
2. Materials are filtered by your selected batch
3. Use subject filter to narrow down materials

### Step 3: View or Download

**View Material:**
- Click **"View"** button
- PDFs and images open in browser/viewer
- Videos will open in video player

**Download Material:**
- Click **"Download"** button
- ⚠️ **Login required** - You must be logged in to download
- File is saved to your device
- Download is tracked in your history

### Features

✅ **Subject Filters**: Quickly find materials by subject
✅ **Download Tracking**: All downloads are logged
✅ **Batch-based Access**: Only see materials for your batch
✅ **Multiple Formats**: PDFs, videos, images all supported
✅ **Offline Access**: Downloaded files work offline

---

## File Type Guide

| Type | Icon | Use Case | Example |
|------|------|----------|---------|
| PDF | 📕 | Notes, Books, Question Papers | Physics Chapter 1 Notes.pdf |
| Video | 🎥 | Lectures, Explanations | Organic Chemistry Lecture 5.mp4 |
| Image | 🖼️ | Diagrams, Formulas | Trigonometry Formula Sheet.jpg |

---

## Storage Structure

Materials are organized in storage as:
```
study-materials/
├── {batch_id}/
│   ├── Physics/
│   │   ├── 1699999999_Motion_Notes.pdf
│   │   └── 1699999999_Thermodynamics_Lecture.mp4
│   ├── Chemistry/
│   │   └── 1699999999_Organic_Chemistry.pdf
│   └── general/
│       └── 1699999999_General_Notes.pdf
```

---

## Troubleshooting

**"Please select a batch from home screen"**
- Go to home screen
- Use the batch selector dropdown
- Choose your institute and batch

**"Login Required" error**
- You must be logged in to download
- Click Login and sign in with your account

**Upload Failed**
- Check file size (must be under 500MB)
- Verify file format is supported
- Check internet connection
- Try again with smaller file

**Download Not Working**
- Ensure you're logged in
- Check storage permissions on your device
- Check internet connection
- Try again

---

## Tips for Students

📌 **Bookmark Important Materials**: Use bookmark feature (coming soon)
📌 **Download for Offline**: Download materials you need frequently
📌 **Organize Downloads**: Keep track of what you've downloaded
📌 **Check Regularly**: New materials are added frequently

---

## Admin Quick Actions

| Action | Steps |
|--------|-------|
| Upload new material | Admin Panel → Materials → + → Fill form → Upload |
| Delete material | Admin Panel → Materials → 🗑️ icon → Confirm |
| View downloads | Admin Panel → Downloads |
| Create batch | Admin Panel → Batches → + → Fill form → Save |

---

**Need Help?** Contact support or check the Help & Support section in the app.
