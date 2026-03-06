# User Management - Role & Status Control

## 📋 Overview

Sistem user management sudah mendukung pengelolaan **role** dan **status** user dengan fitur lengkap untuk admin, termasuk **CRUD operations** (Create, Read, Update, Delete) melalui antarmuka web.

## ✨ Frontend Features

### Complete CRUD Operations

✅ **CREATE** - Add new users

- Form modal untuk menambahkan user baru
- Field: Name, Email, Password, Username (optional), Profile Image URL (optional)
- Otomatis set role, status, dan superuser privileges
- Tombol "Add User" di dashboard

✅ **READ** - View user list and details

- Tabel lengkap dengan pagination (10 items/page)
- Filter by role: admin, registered, premium
- Filter by status: active, inactive
- Search by name, email, username
- View detail user dalam modal
- Responsive design (mobile, tablet, desktop)

✅ **UPDATE** - Edit user data

- Update role (admin/registered/premium)
- Toggle active/inactive status
- Set/unset superuser privileges
- Assign tier_id
- Edit modal dengan validasi

✅ **DELETE** - Remove users

- Soft delete dengan konfirmasi modal
- Menampilkan detail user sebelum delete
- Warning message tentang soft delete
- Data tetap tersimpan di database

### UI Components

- **Stats Cards**: Total users, Admins, Premium users, Active users
- **Search Bar**: Real-time search
- **Filter Dropdowns**: Role dan Status filters
- **Action Buttons**: View, Edit, Delete untuk setiap user
- **Modal Windows**: Create/Edit/View/Delete dengan animasi
- **Success Messages**: Notifikasi setelah operasi berhasil
- **Error Handling**: Pesan error yang informatif

## ✅ Database Structure

### User Table Fields

```sql
- id: UUID (primary key)
- name: VARCHAR(255)
- email: VARCHAR(255) (unique)
- username: VARCHAR(50) (unique, nullable)
- password_hash: VARCHAR
- role: ENUM ('admin', 'registered', 'premium')
- is_active: BOOLEAN (active/inactive status)
- is_superuser: BOOLEAN
- is_deleted: BOOLEAN (soft delete)
- tier_id: INTEGER (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- deleted_at: TIMESTAMP (nullable)
- profile_image_url: VARCHAR (nullable)
```

### User Roles

- **admin**: Administrator with full access
- **registered**: Regular registered user
- **premium**: Premium/paid user

### User Status

- **is_active = true**: User can login and use the system
- **is_active = false**: User is deactivated (cannot login)

## 🚀 API Endpoints

### 1. Get Users by Role

**Requires**: Superuser authentication

```bash
GET /api/v1/users/role/{role}
```

**Parameters**:

- `role`: admin | registered | premium
- `page`: Page number (default: 1)
- `items_per_page`: Items per page (default: 10)

**Example**:

```bash
curl -X GET "http://localhost:8000/api/v1/users/role/premium" \
  -H "Authorization: Bearer <superuser_token>"
```

**Response**:

```json
{
  "data": [
    {
      "id": "019aac02-ac77-7338-ac5b-3a8446f4a76d",
      "name": "Premium User",
      "email": "premium@example.com",
      "role": "premium",
      "is_active": true,
      "created_at": "2025-11-22T14:40:47.736042Z"
    }
  ],
  "total_count": 1,
  "page": 1,
  "size": 10,
  "pages": 1
}
```

### 2. Get Users by Status

**Requires**: Superuser authentication

```bash
GET /api/v1/users/status/{status}
```

**Parameters**:

- `status`: active | inactive
- `page`: Page number (default: 1)
- `items_per_page`: Items per page (default: 10)

**Example**:

```bash
curl -X GET "http://localhost:8000/api/v1/users/status/inactive" \
  -H "Authorization: Bearer <superuser_token>"
```

### 3. Admin Update User

**Requires**: Superuser authentication

```bash
PATCH /api/v1/user/{username}/admin
```

**Body Parameters** (all optional):

- `name`: string (2-255 chars)
- `username`: string (2-20 chars, lowercase alphanumeric)
- `email`: string (valid email)
- `profile_image_url`: string (valid URL)
- `role`: "admin" | "registered" | "premium"
- `is_active`: boolean
- `is_superuser`: boolean
- `tier_id`: integer

**Examples**:

#### Change User Role

```bash
curl -X PATCH "http://localhost:8000/api/v1/user/johndoe/admin" \
  -H "Authorization: Bearer <superuser_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "premium"
  }'
```

#### Deactivate User

```bash
curl -X PATCH "http://localhost:8000/api/v1/user/johndoe/admin" \
  -H "Authorization: Bearer <superuser_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_active": false
  }'
```

#### Update Multiple Fields

```bash
curl -X PATCH "http://localhost:8000/api/v1/user/johndoe/admin" \
  -H "Authorization: Bearer <superuser_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "premium",
    "is_active": true,
    "tier_id": 2
  }'
```

**Response**:

```json
{
  "message": "User johndoe role set to premium, status set to active"
}
```

## 📊 Use Cases

### 1. Promote User to Premium

```bash
# Admin promotes user to premium role
PATCH /api/v1/user/{username}/admin
{
  "role": "premium",
  "tier_id": 2  # Optional: assign premium tier
}
```

### 2. Suspend User Account

```bash
# Admin deactivates user account
PATCH /api/v1/user/{username}/admin
{
  "is_active": false
}
```

### 3. Grant Admin Privileges

```bash
# Admin grants admin role and superuser privileges
PATCH /api/v1/user/{username}/admin
{
  "role": "admin",
  "is_superuser": true
}
```

### 4. Reactivate User

```bash
# Admin reactivates previously suspended user
PATCH /api/v1/user/{username}/admin
{
  "is_active": true
}
```

### 5. Get All Premium Users

```bash
# Get list of all premium users for analytics
GET /api/v1/users/role/premium?page=1&items_per_page=50
```

### 6. Get Inactive Users

```bash
# Get list of all inactive users for cleanup
GET /api/v1/users/status/inactive
```

## 🔒 Security & Permissions

### Endpoint Access Levels

| Endpoint                              | Required Permission | Notes                           |
| ------------------------------------- | ------------------- | ------------------------------- |
| `GET /api/v1/users`                   | Authenticated       | List all users (paginated)      |
| `GET /api/v1/user/me`                 | Authenticated       | Get current user info           |
| `GET /api/v1/user/{username}`         | Authenticated       | Get specific user               |
| `PATCH /api/v1/user/{username}`       | Self or Superuser   | Users can update their own info |
| `PATCH /api/v1/user/{username}/admin` | **Superuser Only**  | Admin-only user management      |
| `GET /api/v1/users/role/{role}`       | **Superuser Only**  | Filter users by role            |
| `GET /api/v1/users/status/{status}`   | **Superuser Only**  | Filter users by status          |
| `DELETE /api/v1/user/{username}`      | Self or Superuser   | Soft delete user                |
| `DELETE /api/v1/db_user/{username}`   | **Superuser Only**  | Hard delete from DB             |

### Important Notes

1. **Superuser Required**: All admin management endpoints require `is_superuser = true`
2. **Self-Update**: Regular users can update their own `name`, `username`, `email`, `profile_image_url`
3. **Admin-Only Fields**: Only superusers can modify `role`, `is_active`, `is_superuser`, `tier_id`
4. **Email Uniqueness**: System validates email uniqueness on update
5. **Username Uniqueness**: System validates username uniqueness on update

## 🧪 Testing

Run the test script:

```bash
python3 test_user_management.py
```

This will test:

- ✅ Get users by role (admin, registered, premium)
- ✅ Get users by status (active, inactive)
- ✅ Admin update user role
- ✅ Admin update user status
- ✅ Admin update multiple fields at once

## 💡 Best Practices

### 1. User Lifecycle Management

```python
# New user registration
POST /api/v1/user
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
# Default: role = "registered", is_active = true

# Upgrade to premium
PATCH /api/v1/user/johndoe/admin
{
  "role": "premium",
  "tier_id": 2
}

# Suspend if needed
PATCH /api/v1/user/johndoe/admin
{
  "is_active": false
}

# Soft delete (keep data)
DELETE /api/v1/user/johndoe
```

### 2. Role-Based Access Control

```python
# Check user role in your endpoints
if current_user["role"] == "admin":
    # Admin-only logic
elif current_user["role"] == "premium":
    # Premium features
else:
    # Standard features
```

### 3. Status Checks

```python
# Verify user is active
if not current_user["is_active"]:
    raise HTTPException(
        status_code=403,
        detail="Your account has been deactivated"
    )
```

## 📝 Database Queries

### Get role distribution

```sql
SELECT role, COUNT(*) as count
FROM users
WHERE is_deleted = false
GROUP BY role;
```

### Get active vs inactive users

```sql
SELECT
  is_active,
  COUNT(*) as count
FROM users
WHERE is_deleted = false
GROUP BY is_active;
```

### Find users to clean up

```sql
SELECT * FROM users
WHERE is_active = false
AND is_deleted = false
AND updated_at < NOW() - INTERVAL '90 days';
```

## 🔐 How to Become a Superuser

### Understanding Superuser Permissions

**Superuser** adalah permission level tertinggi dalam sistem. User dengan `is_superuser = true` dapat melakukan operasi-operasi berikut:

- ✅ Membuat user baru (CREATE)
- ✅ Menghapus user (DELETE/soft delete)
- ✅ Mengubah role user (admin/registered/premium)
- ✅ Mengaktifkan/menonaktifkan user
- ✅ Memberikan superuser permission ke user lain
- ✅ Mengakses semua filter endpoint (role/status)

### Warning Signs You're Not a Superuser

Jika Anda melihat tanda-tanda berikut di UI, berarti Anda **bukan superuser**:

- ⚠️ Banner kuning "Limited Permissions" di halaman User Management
- ⚠️ Tombol "Add User" tidak berfungsi
- ⚠️ Error 403 Forbidden saat mencoba edit role
- ⚠️ Checkbox "Superuser" tidak tersimpan saat create/edit user
- ⚠️ Tidak bisa delete user

### Method 1: Direct Database Update (Recommended for First Setup)

**Use Case**: Saat pertama kali setup sistem atau tidak ada superuser yang aktif.

**Steps**:

1. Connect ke PostgreSQL database:

```bash
# Using psql
psql -U postgres -d your_database_name

# Or using pgAdmin, DBeaver, or any PostgreSQL client
```

2. Check current superusers:

```sql
SELECT id, username, email, role, is_superuser
FROM users
WHERE is_deleted = false
ORDER BY created_at DESC;
```

3. Grant superuser permission to your account:

```sql
-- By username (recommended)
UPDATE users
SET is_superuser = true
WHERE username = 'your-username'
AND is_deleted = false;

-- Or by email
UPDATE users
SET is_superuser = true
WHERE email = 'your-email@example.com'
AND is_deleted = false;
```

4. Verify the update:

```sql
SELECT username, email, role, is_superuser
FROM users
WHERE is_superuser = true
AND is_deleted = false;
```

5. Logout dan login kembali untuk refresh JWT token.

### Method 2: Request from Existing Superuser

**Use Case**: Sudah ada superuser yang aktif dalam sistem.

**Steps**:

1. Contact existing superuser via email/chat
2. Provide your username or email
3. Superuser can grant permission via:

**Option A: Via Web UI** (if superuser has access)

- Login as superuser
- Go to User Management dashboard
- Find your user account
- Click "Edit" button
- Check the "Superuser" checkbox
- Click "Save Changes"

**Option B: Via API Request**

```bash
curl -X PATCH "http://localhost:8000/api/v1/user/{your-username}/admin" \
  -H "Authorization: Bearer <superuser_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_superuser": true
  }'
```

4. Logout dan login kembali untuk refresh JWT token.

### Method 3: Backend Script/Seeder (If Available)

**Use Case**: Automated superuser creation during deployment.

Check if your backend has a seeder script:

```bash
# Example for Python FastAPI backend
cd backend/
python scripts/create_superuser.py

# Follow the prompts:
# - Enter email
# - Enter password
# - Enter username (optional)
```

### Verifying Superuser Status

After granting superuser permission, verify it works:

**1. Via Web UI**:

- Login to dashboard
- Navigate to User Management
- Look for blue info banner showing "Superuser" badge
- NO yellow warning banner should appear

**2. Via API**:

```bash
# Get current user info
curl -X GET "http://localhost:8000/api/v1/user/me" \
  -H "Authorization: Bearer <your_token>"

# Response should include:
{
  "id": "...",
  "username": "your-username",
  "email": "your@email.com",
  "role": "admin",
  "is_superuser": true,  // ← Should be true
  "is_active": true
}
```

**3. Test Permissions**:

- Try creating a new user → Should work
- Try changing user role → Should work
- Try deleting a user → Should work
- All without 403 errors

### Common Issues & Troubleshooting

#### Issue 1: Checkbox tidak tersimpan setelah create user

**Problem**: Checklist "Superuser" saat create user tapi tidak tersimpan.

**Cause**: Current logged-in user bukan superuser, mendapat 403 error saat PATCH `/user/{username}/admin`.

**Solution**: Gunakan Method 1 (Direct Database Update) untuk menjadi superuser terlebih dahulu.

#### Issue 2: 403 Forbidden saat edit role/superuser

**Problem**: Error "You don't have permission" saat mencoba edit.

**Cause**: Hanya superuser yang bisa mengubah role dan superuser status.

**Solution**: Request superuser permission dari existing superuser (Method 2).

#### Issue 3: Still not superuser after database update

**Problem**: Sudah update database tapi masih muncul warning banner.

**Cause**: JWT token masih cached dengan old data.

**Solution**:

1. Logout completely (clear localStorage)
2. Close all browser tabs
3. Login again
4. Token baru akan include `is_superuser: true`

#### Issue 4: No existing superuser in system

**Problem**: Tidak ada satu pun superuser yang aktif.

**Cause**: Fresh installation atau semua superuser di-delete.

**Solution**: Use Method 1 (Direct Database Update) - ini satu-satunya cara tanpa memerlukan existing superuser.

### Security Best Practices

⚠️ **Important Security Notes**:

1. **Limit Superusers**: Hanya berikan ke trusted admins
2. **Audit Trail**: Log semua superuser actions
3. **Regular Review**: Audit superuser list secara berkala
4. **Revoke When Needed**: Remove superuser dari user yang tidak lagi memerlukan

```sql
-- Audit: List all superusers
SELECT username, email, role, created_at, updated_at
FROM users
WHERE is_superuser = true
AND is_deleted = false
ORDER BY created_at DESC;

-- Revoke superuser permission
UPDATE users
SET is_superuser = false
WHERE username = 'old-admin'
AND is_deleted = false;
```

## ✅ Summary

**Features Implemented:**

- ✅ Three user roles: admin, registered, premium
- ✅ User status management: active/inactive
- ✅ Superuser privileges
- ✅ Get users by role endpoint
- ✅ Get users by status endpoint
- ✅ Admin update endpoint for role & status
- ✅ Proper permissions and security
- ✅ Comprehensive testing

**All user management features are ready to use!** 🎉
