# Supabase Configuration

## Your Supabase Details

- **Project URL**: https://xiljmpvpyirozkvtuzif.supabase.co
- **API Key**: `sb_publishable_nPnE1muYsQagqdQUKuW5nQ_GyC6XpG3`

## ✅ Setup Complete

The backend is now configured to use Supabase with the Python client (REST API).

### Environment Variables (already added to .env)

```env
SUPABASE_URL=https://xiljmpvpyirozkvtuzif.supabase.co
SUPABASE_KEY=sb_publishable_nPnE1muYsQagqdQUKuW5nQ_GyC6XpG3
```

## 📊 Create Database Tables

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/xiljmpvpyirozkvtuzif
2. Click on **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `supabase_schema.sql` and paste it
5. Click **Run** to create all tables

The SQL script creates:
- `users` - User accounts
- `sessions` - User session tokens
- `pending_registrations` - OTP verification pending
- `rooms` - Hotel room types
- `room_inventory` - Daily availability/pricing
- `bookings` - Reservations
- `payments` - Payment records
- `promo_codes` - Discount codes
- `audit_logs` - Audit trail

## 🚀 Running the Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload
```

## 📝 How Supabase Client Works

The Supabase Python client uses REST API calls instead of direct database connections.

### Query Examples

```python
from app.database import get_supabase

supabase = get_supabase()

# Select (find)
result = supabase.table("users").select("*").eq("email", "test@example.com").execute()
user = result.data[0] if result.data else None

# Insert (create)
result = supabase.table("users").insert({
    "email": "test@example.com",
    "name": "Test User",
    "password_hash": "...",
    "phone": "1234567890"
}).execute()

# Update
result = supabase.table("users").update({
    "status": "active"
}).eq("id", user_id).execute()

# Delete
result = supabase.table("users").delete().eq("id", user_id).execute()
```

## 🔐 Security Notes

1. **API Key Types**:
   - `anon` key (public) - For frontend, respects Row Level Security
   - `service_role` key (secret) - For backend, bypasses RLS
   
2. For production, use the `service_role` key in your backend `.env`

3. You can find both keys in: **Settings → API → Project API keys**

## 📚 Resources

- [Supabase Python Client Docs](https://supabase.com/docs/reference/python/introduction)
- [Supabase Dashboard](https://supabase.com/dashboard/project/xiljmpvpyirozkvtuzif)
