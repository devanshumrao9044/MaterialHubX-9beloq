# 🔧 ADMIN PANEL TESTING GUIDE

## ✅ समस्या हल हो गई है!

**समस्या थी:** Database और Storage में RLS policies के कारण admin upload नहीं हो पा रहा था।

**Fix किया गया:** 
- ✅ सभी tables के लिए `authenticated_can_manage_*` policies add की गई
- ✅ Storage में upload/update/delete permissions add किए गए
- ✅ अब admin login करके सब कुछ upload कर सकता है

---

## 📋 STEP-BY-STEP TESTING

### 1️⃣ LOGIN AS ADMIN
```
Email: admin@materialhubx.com
Password: Admin@123
```

**Test करें:**
- [ ] Login successful होना चाहिए
- [ ] Side drawer में "Admin Panel" option दिखना चाहिए

---

### 2️⃣ BATCH CREATE करें

**Steps:**
1. Side drawer → "Admin Panel" पर click करें
2. "Batches" card पर click करें
3. Top-right में + icon पर click करें
4. Fill करें:
   - Batch Name: `ARJUNA JEE 2026`
   - Class Level: `11th`
   - Exam Type: `IIT JEE`
   - Description: `Foundation batch for JEE preparation`
5. "Save" button दबाएं

**Expected Result:**
- ✅ "Batch created successfully" message दिखे
- ✅ List में नया batch दिखे
- ✅ कोई error न आए

---

### 3️⃣ MATERIAL UPLOAD करें

**Steps:**
1. Admin Panel → "Materials" पर click करें
2. Top-right में + icon पर click करें
3. "Choose File" पर click करें
4. कोई भी PDF/Video file select करें
5. Fill करें:
   - Batch: अभी बनाया हुआ batch select करें
   - Title: `Physics - Motion in a Straight Line`
   - Subject: `Physics`
   - Chapter: `Kinematics`
   - Description: `Concepts of velocity and acceleration`
6. "Upload" button दबाएं

**Expected Result:**
- ✅ Progress दिखाई दे: "Reading file..." → "Uploading to storage..." → "Saving to database..."
- ✅ "Material uploaded successfully" message दिखे
- ✅ List में नया material दिखे
- ✅ File OnSpace Storage में save हो

**अगर Error आए:**
- Console में detailed error log check करें
- Network tab में request check करें (403 errors नहीं होने चाहिए)

---

### 4️⃣ STORE PRODUCT CREATE करें

**Steps:**
1. Admin Panel → "Store" पर click करें
2. Top-right में + icon पर click करें
3. "Upload Product Image" पर click करें → कोई image select करें
4. Fill करें:
   - Product Name: `Advanced Physics Notes`
   - Description: `Comprehensive notes for JEE Physics`
   - Category: `notes` select करें
   - Price: `299`
   - Original Price: `499`
   - Stock Quantity: `100`
5. "Create" button दबाएं

**Expected Result:**
- ✅ Image preview दिखे upload करने से पहले
- ✅ Progress: "Uploading image..." → "Creating product..."
- ✅ "Product created successfully" message
- ✅ Product automatically approved हो (admin के लिए)
- ✅ Store tab में product दिखे

---

### 5️⃣ COUPON CREATE करें

**Steps:**
1. Admin Panel → "Coupons" पर click करें
2. Top-right में + icon पर click करें
3. Fill करें:
   - Coupon Code: `SAVE20`
   - Discount Type: `Percentage` select करें
   - Discount: `20`
   - Min Purchase Amount: `500`
   - Max Discount Amount: `100`
   - Usage Limit: `50`
4. "Create" button दबाएं

**Expected Result:**
- ✅ "Coupon created successfully" message
- ✅ Coupon list में दिखे
- ✅ Status "Active" हो

---

### 6️⃣ USER VIEW में VERIFY करें

**Logout करें और normal user की तरह login करें:**

1. **Store Check:**
   - Store tab पर जाएं
   - Admin द्वारा बनाया product दिखना चाहिए
   - Product पर click करके detail page खुलना चाहिए

2. **Library Check:**
   - Library/Materials में जाएं
   - Admin द्वारा upload किया material दिखना चाहिए
   - Download/view होना चाहिए

3. **Coupon Check:**
   - Cart में कुछ add करें
   - Checkout पर जाएं
   - Coupon code `SAVE20` apply करें
   - Discount calculate होना चाहिए

---

## 🐛 COMMON ERRORS & FIXES

### Error: "403 Forbidden"
**Cause:** RLS policy issue  
**Fix:** Already fixed! Reload करें।

### Error: "Upload failed: ..."
**Cause:** File reading issue  
**Check:**
- File size 500MB से कम है?
- File type allowed है (PDF/Video/Image)?
- Internet connection stable है?

### Error: "Database error: ..."
**Cause:** Missing required fields  
**Fix:** सभी mandatory fields (*) fill करें

### Error: "Storage deletion warning"
**Cause:** File already deleted या path wrong  
**Fix:** Normal है, database entry remove हो जाएगी

---

## 📊 VERIFY DATABASE

OnSpace Cloud Dashboard में जाकर verify करें:

1. **Data Tab → Tables:**
   - `batches` table में entry दिखनी चाहिए
   - `study_materials` table में entry दिखनी चाहिए
   - `store_products` table में entry दिखनी चाहिए (approval_status = 'approved')
   - `coupons` table में entry दिखनी चाहिए (is_active = true)

2. **Storage Tab → study-materials bucket:**
   - Uploaded files दिखने चाहिए organized folders में

---

## ✅ SUCCESS CHECKLIST

- [ ] Admin login successful
- [ ] Batch create हो गया
- [ ] Material upload हो गया (file storage में save हुई)
- [ ] Store product create हो गया (image के साथ)
- [ ] Coupon create हो गया
- [ ] Normal user को सब कुछ दिख रहा है
- [ ] कोई 403 errors नहीं आ रहे
- [ ] Database में entries save हैं
- [ ] Storage में files हैं

---

## 🆘 अगर अभी भी काम नहीं कर रहा?

**Debug Steps:**

1. **Console Logs Check करें:**
   - Browser के Developer Tools खोलें (F12)
   - Console tab में errors देखें
   - Network tab में failed requests देखें

2. **Specific Error बताएं:**
   - कौन सी screen पर error आ रही है?
   - Error message क्या है?
   - Console में क्या दिख रहा है?

3. **Screenshot Share करें:**
   - Error message का
   - Console logs का
   - Network tab का

---

## 📝 NOTES

- **Admin Email:** केवल `admin@materialhubx.com` को admin access है
- **Automatic Approval:** Admin द्वारा बनाए products automatically approved होते हैं
- **File Size Limit:** Maximum 500MB per file
- **Supported Formats:** PDF, MP4, MKV, JPG, PNG, PPT, PPTX
- **Coupon Codes:** Always uppercase में save होते हैं

---

## 🎉 अब सब काम करना चाहिए!

Permissions fix हो गई हैं। अब आप admin panel से:
- ✅ Batches create कर सकते हैं
- ✅ Materials upload कर सकते हैं (PDFs, Videos)
- ✅ Store products add कर सकते हैं (images के साथ)
- ✅ Coupons create कर सकते हैं
- ✅ Orders manage कर सकते हैं

**सब कुछ OnSpace Cloud backend में real-time save होगा!**
