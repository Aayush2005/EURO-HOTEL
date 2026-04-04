"""
Initialize Euro Hotel rooms with updated configuration
Contact: rudraramreservations@eurohotel.in
Phone: +91 77299 00091
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from datetime import datetime, timezone
from app.database import get_supabase

# Hotel contact information
HOTEL_CONTACT = {
    "email": "rudraramreservations@eurohotel.in",
    "phone": "+91 77299 00091",
    "address": "Euro Hotel, Opp post office Mumbai highway Rudraram village Patancheru Mandal Sangareddy Dist Telangana 502329"
}

# Room amenities
STANDARD_AMENITIES = [
    "Mini bar", "Iron board with iron", "Tea kettle", "Television", 
    "WiFi", "Air conditioning", "Bathroom toiletries", "Soap", 
    "Conditioner", "Shampoo", "Comb", "Slippers", "Bath towels", 
    "Hand towels", "Bath robes", "Floor mats"
]

# Additional services
HOTEL_SERVICES = [
    "24x7 Room Service", "Butler service", "Laundry facility", 
    "24x7 Barista cafe", "Luxury cab service", "Airport pickup & drop",
    "Tour planning", "Ticket booking", "Group tour management",
    "Corporate tours", "Parking", "Multicuisine restaurant"
]

# Hotel policies
HOTEL_POLICIES = {
    "check_in": "2:00 PM",
    "check_out": "12:00 PM",
    "id_required": True,
    "outside_guests": False,
    "smoking": "No smoking in rooms - Separate smoking zone available",
    "extra_bed_charge": 1500,
    "cancellation": "48 hours before check-in for full refund (minus GST)",
    "gst_rate_under_7500": 0.05,
    "gst_rate_over_7500": 0.12
}

# F&B Outlets
FB_OUTLETS = [
    {"name": "nH-65 Fine Dining Restaurant", "location": "First Floor", "timing": "12 PM to 12 AM"},
    {"name": "nH-65 Casual Dining Restaurant", "timing": "7 AM to 12 AM"},
    {"name": "Barista Cafe", "timing": "24x7", "note": "Dine-in only at cafe for room service"},
    {"name": "Room F&B Service", "timing": "7 AM to 12 AM"}
]

# Concierge Services
CONCIERGE_SERVICES = [
    "Luxury Cabs Service",
    "Laundry Service", 
    "Tour Plan with Sightseeing",
    "Travel Help",
    "Ticket Booking",
    "Group Tour Management",
    "Corporate Tour"
]

def create_rooms():
    """Create Euro Hotel room types (only 3 room types with inventory)"""
    supabase = get_supabase()
    
    # Clear existing rooms
    supabase.table("rooms").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("Cleared existing rooms")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Only 3 room types with total inventory
    rooms_data = [
        {
            "id": str(uuid.uuid4()),
            "slug": "eh-deluxe-highway-view",
            "title": "EH Deluxe Room Highway View",
            "description": "Spacious deluxe room with stunning highway view, premium amenities and modern furnishing. Perfect for business and leisure travelers seeking comfort and style.",
            "room_type": "eh_deluxe_highway_view",
            "amenities": STANDARD_AMENITIES + ["Highway view", "Premium furnishing", "Work desk", "Extra bed available"],
            "base_price": 6500.0,
            "max_occupancy": 3,
            "bed_configuration": "1 King Bed",
            "room_size": "350 sq ft",
            "floor": "1st Floor",
            "view": "Highway View",
            "cancellation_policy": "free_48h",
            "images": [
                {"url": "/images/rooms/deluxe-highway-1.jpg", "alt": "EH Deluxe Highway View Room", "is_primary": True, "order": 1},
                {"url": "/images/rooms/deluxe-highway-2.jpg", "alt": "EH Deluxe Highway View Room Interior", "is_primary": False, "order": 2}
            ],
            "room_metadata": {
                "total_rooms": 2,
                "extra_bed_available": True,
                "extra_bed_charge": 1500
            },
            "active": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "slug": "eh-premium",
            "title": "EH Premium Room",
            "description": "Well-appointed premium room with modern amenities and comfortable furnishing. Ideal for comfortable stays with all essential facilities.",
            "room_type": "eh_premium",
            "amenities": STANDARD_AMENITIES + ["Premium amenities", "City view", "Extra bed available"],
            "base_price": 5000.0,
            "max_occupancy": 3,
            "bed_configuration": "1 Queen Bed",
            "room_size": "300 sq ft",
            "floor": "2nd & 3rd Floor",
            "view": "City View",
            "cancellation_policy": "free_48h",
            "images": [
                {"url": "/images/rooms/premium-1.jpg", "alt": "EH Premium Room", "is_primary": True, "order": 1},
                {"url": "/images/rooms/premium-2.jpg", "alt": "EH Premium Room Interior", "is_primary": False, "order": 2}
            ],
            "room_metadata": {
                "total_rooms": 15,
                "extra_bed_available": True,
                "extra_bed_charge": 1500
            },
            "active": True,
            "created_at": now,
            "updated_at": now
        },
        {
            "id": str(uuid.uuid4()),
            "slug": "eh-superior",
            "title": "EH Superior Room",
            "description": "Compact superior room with essential amenities. Perfect for budget-conscious travelers without compromising on comfort and quality.",
            "room_type": "eh_superior",
            "amenities": STANDARD_AMENITIES,
            "base_price": 4000.0,
            "max_occupancy": 2,
            "bed_configuration": "1 Double Bed",
            "room_size": "250 sq ft",
            "floor": "3rd & 4th Floor",
            "view": "Garden View",
            "cancellation_policy": "free_48h",
            "images": [
                {"url": "/images/rooms/superior-1.jpg", "alt": "EH Superior Room", "is_primary": True, "order": 1},
                {"url": "/images/rooms/superior-2.jpg", "alt": "EH Superior Room Interior", "is_primary": False, "order": 2}
            ],
            "room_metadata": {
                "total_rooms": 19,
                "extra_bed_available": False
            },
            "active": True,
            "created_at": now,
            "updated_at": now
        }
    ]
    
    # Insert rooms
    result = supabase.table("rooms").insert(rooms_data).execute()
    
    print(f"\n✅ Successfully created 3 room types:")
    print(f"   - EH Deluxe Highway View: 2 rooms @ ₹6,500 + GST")
    print(f"   - EH Premium: 15 rooms @ ₹5,000 + GST") 
    print(f"   - EH Superior: 19 rooms @ ₹4,000 + GST")
    print(f"   Total inventory: 36 rooms")
    print(f"\n📞 Contact: {HOTEL_CONTACT['email']}")
    print(f"   Phone: {HOTEL_CONTACT['phone']}")
    print(f"\n📋 Policies:")
    print(f"   - GST: 5% under ₹7,500 tariff")
    print(f"   - Extra bed: ₹1,500")
    print(f"   - Cancellation: 48 hours before check-in (refund minus GST)")
    print(f"   - ID Required, No outside guests, No smoking in rooms")
    
    return rooms_data

if __name__ == "__main__":
    create_rooms()
