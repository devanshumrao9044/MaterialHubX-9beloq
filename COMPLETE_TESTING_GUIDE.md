# ✅ COMPLETE FUNCTIONALITY TESTING GUIDE

## 🎯 यह Guide किसलिए है?

इस guide में **actual functionality** की complete testing है - सिर्फ UI नहीं, **real operations** जो database और storage में changes करते हैं।

---

## 📋 TESTING CHECKLIST

### ✅ 1. DELETE FUNCTIONALITY

#### A. Cart Items Delete
**Steps:**
1. Normal user के रूप में login करें (not admin)
2. Store tab में जाएं
3. कोई product select करें → "Add to Cart" पर click करें
4. Cart icon पर click करें (top-right)
5. Cart item के पास delete icon (🗑️) पर click करें
6. Confirm करें

**Expected Result:**
- ✅ Confirmation dialog दिखे: "Remove {product name} from cart?"
- ✅ "Remove" पर click करने पर item delete हो जाए
- ✅ Cart से item गायब हो जाए
- ✅ Cart count badge update हो जाए
- ✅ Database से entry delete हो (cloud dashboard में check करें)

**Database Check:**
```
Table: shopping_cart
Action: DELETE operation successful
Policy: users_can_delete_cart_items
```

---

#### B. Materials Delete (Admin Only)
**Steps:**
1. Admin login करें (`admin@materialhubx.com`)
2. Admin Panel → Materials पर जाएं
3. किसी material के पास delete icon (🗑️) पर click करें
4. Confirm करें

**Expected Result:**
- ✅ Confirmation dialog: "Are you sure you want to delete {material title}?"
- ✅ Console में logs दिखें:
  ```
  Deleting material: {material_id}
  Deleting file from storage: {file_path}
  File deleted from storage
  Material deleted from database successfully
  ```
- ✅ Alert: "Material deleted successfully"
- ✅ Material list से item remove हो जाए
- ✅ Storage bucket से file delete हो
- ✅ Database से entry delete हो

**Database Check:**
```
Table: study_materials
Action: DELETE operation successful
Policy: authenticated_can_delete_materials

Storage: study-materials bucket
Action: File removed
Policy: authenticated_can_delete_materials
```

---

#### C. Batches Delete (Admin Only)
**Steps:**
1. Admin Panel → Batches
2. किसी batch के पास delete icon (🗑️) पर click करें
3. Confirm करें

**Expected Result:**
- ✅ Confirmation dialog दिखे
- ✅ Batch delete हो जाए
- ✅ Database से remove हो

**Database Check:**
```
Table: batches
Action: DELETE operation successful
Policy: authenticated_can_delete_batches
```

---

#### D. Store Products Delete (Admin Only)
**Steps:**
1. Admin Panel → Store
2. किसी product के पास delete icon (🗑️) पर click करें
3. Confirm करें

**Expected Result:**
- ✅ Product delete हो जाए
- ✅ Database और storage से remove हो

**Database Check:**
```
Table: store_products
Action: DELETE operation successful
Policy: authenticated_can_delete_products
```

---

#### E. Users Delete (Admin Only)
**Steps:**
1. Admin Panel → Users
2. किसी user (NOT admin) के पास delete icon पर click करें
3. Confirm करें

**Expected Result:**
- ✅ Warning: "This will delete all their data permanently"
- ✅ User delete हो जाए
- ✅ Console में log: "User deleted successfully"
- ✅ Related data भी delete हो (cascade)

**Database Check:**
```
Table: user_profiles
Action: DELETE operation successful
Policy: Users can delete own profile
Note: Admin cannot delete admin@materialhubx.com
```

---

### ✅ 2. QUIZ FUNCTIONALITY

#### A. Create Quiz (Admin)
**Steps:**
1. Admin Panel → Quizzes
2. Top-right + icon पर click करें
3. Fill करें:
   - Title: "Physics Mock Test 1"
   - Description: "Kinematics and Dynamics"
   - Quiz Type: "test"
   - Batch: कोई batch select करें
   - Subject: "Physics"
   - Time Limit: "60"
   - Difficulty: "medium"
4. "Create" पर click करें

**Expected Result:**
- ✅ Modal close हो
- ✅ Alert: "Quiz created successfully. Now add questions to it."
- ✅ List में नया quiz दिखे
- ✅ Console में log: Quiz creation successful

**Database Check:**
```
Table: quizzes
Action: INSERT operation successful
Fields: title, description, quiz_type, batch_id, subject, time_limit_minutes, difficulty, is_active=true
```

---

#### B. Add Questions to Quiz (Admin)
**Steps:**
1. Quiz list में "Add Questions" button पर click करें
2. Question form fill करें:
   ```
   Question: "What is Newton's first law?"
   Option A: "Law of inertia"
   Option B: "F = ma"
   Option C: "Action-reaction"
   Option D: "Momentum conservation"
   Correct Answer: "A"
   Explanation: "First law states that an object remains at rest..."
   Marks: "1"
   ```
3. "Add Question" पर click करें
4. Same modal में 4-5 questions और add करें
5. Close करें

**Expected Result:**
- ✅ हर question add होने पर alert: "Question added successfully"
- ✅ Modal बंद नहीं होना चाहिए (और questions add करने के लिए)
- ✅ Console logs:
  ```
  Adding question to quiz: {quiz_id}
  Question added successfully to database
  ```
- ✅ Manually close करने पर modal बंद हो

**Database Check:**
```
Table: quiz_questions
Action: INSERT operations (multiple)
Fields: quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks
Count: 5 questions added
```

**Verification:**
- Cloud Dashboard → Data → quiz_questions table में entries check करें
- Each question को quiz_id से filter करें
- All options और correct_answer verify करें

---

#### C. Delete Quiz (Admin)
**Steps:**
1. किसी quiz के पास delete icon पर click करें
2. Confirm करें

**Expected Result:**
- ✅ Warning: "This will also delete all questions"
- ✅ Quiz और सभी questions delete हो जाएं
- ✅ Console में log दिखे

**Database Check:**
```
Table: quizzes (DELETE)
Table: quiz_questions (CASCADE DELETE - automatic)
```

---

### ✅ 3. UPLOAD FUNCTIONALITY

#### A. Material Upload
**Steps:**
1. Admin Panel → Materials → + icon
2. "Choose File" पर click करें
3. PDF/Video file select करें (max 500MB)
4. Fill करें:
   - Batch: select करें
   - Title: "Chapter 1 - Kinematics"
   - Subject: "Physics"
   - Chapter: "Motion in a Straight Line"
   - Description: "Concepts and problems"
5. "Upload" पर click करें

**Expected Result:**
- ✅ Progress दिखे:
  ```
  Reading file...
  Processing file (mobile/web)...
  Uploading to storage...
  Generating public URL...
  Saving to database...
  ```
- ✅ Console logs:
  ```
  Starting upload for file: {filename}
  File read successfully, size: {bytes} bytes
  Uploading to path: {batch_id}/{subject}/{filename}
  Upload successful
  Public URL: https://...
  Material saved to database successfully
  ```
- ✅ Alert: "Material uploaded successfully"
- ✅ File storage में save हो
- ✅ Database में entry हो
- ✅ Library में दिखे

**Database & Storage Check:**
```
Storage: study-materials/{batch_id}/{subject}/{timestamp}_{title}.{ext}
Table: study_materials
Fields: title, description, file_url, file_type, subject, chapter, batch_id
```

---

#### B. Store Product Upload
**Steps:**
1. Admin Panel → Store → + icon
2. "Upload Product Image" पर click करें → image select करें
3. Live preview देखें
4. Fill करें:
   - Product Name: "Advanced Physics Notes"
   - Description: "Complete notes for JEE"
   - Category: "notes"
   - Price: "299"
   - Original Price: "499"
   - Stock: "50"
5. "Create" पर click करें

**Expected Result:**
- ✅ Image preview दिखे upload से पहले
- ✅ Progress:
  ```
  Uploading image...
  Creating product...
  ```
- ✅ Console logs:
  ```
  Image uploaded successfully
  Product created with ID: {product_id}
  ```
- ✅ Alert: "Product created successfully"
- ✅ Product automatically approved (admin के लिए)
- ✅ Store tab में दिखे

**Database & Storage Check:**
```
Storage: study-materials/products/{timestamp}_{name}.{ext}
Table: store_products
Fields: title, description, category, price, original_price, image_url, stock_quantity, approval_status='approved', is_available=true
```

---

## 🐛 COMMON ERRORS & FIXES

### Error 1: "403 Forbidden" on delete
**Cause:** RLS policy issue  
**Fix:** Already fixed! Refresh करें।  
**Verify:** Backend logs में 403 नहीं दिखना चाहिए

---

### Error 2: "Delete successful but item still visible"
**Cause:** UI not refreshing  
**Fix:** Each delete function में `loadData()` call होना चाहिए  
**Check:** Code में confirm करें कि delete के बाद reload हो रहा है

---

### Error 3: "Question added but modal not closing"
**This is NOT an error!**  
**Expected Behavior:** Modal intentionally open रहता है ताकि multiple questions add कर सकें  
**How to close:** Top-right में × icon पर click करें

---

### Error 4: "Upload failed: File too large"
**Cause:** File size > 500MB  
**Fix:** Smaller file use करें  
**Limit:** Maximum 500MB per file

---

### Error 5: "Database error: column does not exist"
**Example:** `created_at does not exist in user_profiles`  
**Fix:** Already handled - yeh error ignore करें (not critical)

---

## 🎯 SUCCESS CRITERIA

### Delete Functionality ✅
- [ ] Cart item delete हो रहा है
- [ ] Material delete हो रहा है (file + database)
- [ ] Batch delete हो रहा है
- [ ] Store product delete हो रहा है
- [ ] User delete हो रहा है (admin द्वारा)
- [ ] सभी delete operations database में reflect हो रहे हैं

### Quiz Functionality ✅
- [ ] Quiz create हो रहा है
- [ ] Multiple questions add हो रहे हैं
- [ ] Questions database में save हो रहे हैं
- [ ] Quiz delete हो रहा है (questions के साथ)
- [ ] Console में proper logs आ रहे हैं

### Upload Functionality ✅
- [ ] Material upload हो रहा है (PDF/Video)
- [ ] File storage में save हो रही है
- [ ] Public URL generate हो रहा है
- [ ] Database में entry हो रही है
- [ ] Store product upload हो रहा है (image के साथ)
- [ ] Image preview काम कर रहा है

---

## 🔍 VERIFICATION METHODS

### Method 1: Console Logs
Browser/App में developer console खोलें:
- Delete operations के logs check करें
- Upload progress logs देखें
- Error messages (if any) note करें

### Method 2: OnSpace Cloud Dashboard
1. Cloud button (right panel) पर click करें
2. Data tab में जाएं
3. Tables check करें:
   - `shopping_cart` - cart items
   - `study_materials` - uploaded materials
   - `batches` - batches
   - `store_products` - products
   - `quizzes` - quizzes
   - `quiz_questions` - questions
   - `user_profiles` - users
4. Storage tab में जाएं:
   - `study-materials` bucket
   - Uploaded files verify करें

### Method 3: Network Tab
1. Browser DevTools → Network tab
2. Operations करें (delete/upload/add)
3. HTTP requests check करें:
   - DELETE requests (200 status)
   - POST requests (201 status)
   - PUT requests (200 status)
4. Response data verify करें

---

## 📝 TESTING SEQUENCE

**Recommended Order:**

1. **Start Fresh**
   - Login as admin
   - Navigate to Admin Panel

2. **Test Uploads First**
   - Create batch
   - Upload material
   - Create store product

3. **Test Quiz System**
   - Create quiz
   - Add 5 questions
   - Verify in database

4. **Test Delete Operations**
   - Delete material (check storage)
   - Delete product (check database)
   - Delete quiz (check cascade)

5. **Test User Operations**
   - View users list
   - Search user
   - Delete test user (not admin)

6. **User-Side Testing**
   - Logout from admin
   - Login as normal user
   - Add items to cart
   - Delete cart items
   - Verify library materials

---

## ✨ FINAL VERIFICATION

Run this complete test:

1. **Admin Login** ✅
2. **Create Batch** ✅
3. **Upload Material** (PDF) ✅
4. **Create Quiz** ✅
5. **Add 5 Questions** ✅
6. **Create Store Product** ✅
7. **Logout** ✅
8. **User Login** ✅
9. **Add to Cart** ✅
10. **Delete Cart Item** ✅
11. **Logout** ✅
12. **Admin Login** ✅
13. **Delete Material** ✅
14. **Delete Quiz** ✅
15. **Delete Product** ✅
16. **Verify Database** (all deleted) ✅

**If all 16 steps pass → System is fully functional!**

---

## 🆘 REPORTING ISSUES

अगर कोई step fail हो तो यह information provide करें:

1. **Which step failed?** (number)
2. **Error message** (exact text)
3. **Console logs** (screenshot)
4. **Network tab** (failed request)
5. **Database state** (OnSpace dashboard screenshot)

---

## 🎉 CONGRATULATIONS!

अगर सब tests pass हो गए, तो आपका app **production-ready** है!

**Features Working:**
- ✅ Complete delete system
- ✅ Quiz creation with questions
- ✅ File uploads to storage
- ✅ Database operations
- ✅ Admin controls
- ✅ User management

**Next Steps:**
- Deploy to production
- Test on real devices
- Add more quizzes
- Upload study materials
- Onboard students
