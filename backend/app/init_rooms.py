"""
Initialize Euro Hotel rooms with updated configuration
Contact: rudraramreservations@eurohotel.in
Phone: +91 77299 00091
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from datetime import datetime
from app.database import init_db
from app.models.booking import Room, RoomType, CancellationPolicy, RoomImage

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

async def create_rooms():
    """Create Euro Hotel rooms with new pricing structure"""
    
    # Clear existing rooms
    await Room.delete_all()
    
    rooms_data = [
        # EH Deluxe Highway View Rooms (6500 + GST)
        {
            "slug": "eh-deluxe-highway-view-1",
            "title": "EH Deluxe Room Highway View - 101",
            "description": "Spacious deluxe room with highway view, premium amenities and modern furnishing. Perfect for business and leisure travelers.",
            "room_type": RoomType.EH_DELUXE_HIGHWAY_VIEW,
            "amenities": STANDARD_AMENITIES + ["Highway view", "Premium furnishing", "Work desk"],
            "base_price": 6500.0,
            "max_occupancy": 3,
            "bed_configuration": "1 King Bed",
            "room_size": "350 sq ft",
            "floor": "1st Floor",
            "view": "Highway View",
            "cancellation_policy": CancellationPolicy.FREE_48H,
            "images": [
                RoomImage(url="/images/rooms/deluxe-highway-1.jpg", alt="EH Deluxe Highway View Room", is_primary=True, order=1)
            ]
        },
        {
            "slug": "eh-deluxe-highway-view-2",
            "title": "EH Deluxe Room Highway View - 102",
            "description": "Spacious deluxe room with highway view, premium amenities and modern furnishing. Perfect for business and leisure travelers.",
            "room_type": RoomType.EH_DELUXE_HIGHWAY_VIEW,
            "amenities": STANDARD_AMENITIES + ["Highway view", "Premium furnishing", "Work desk"],
            "base_price": 6500.0,
            "max_occupancy": 3,
            "bed_configuration": "1 King Bed",
            "room_size": "350 sq ft",
            "floor": "1st Floor",
            "view": "Highway View",
            "cancellation_policy": CancellationPolicy.FREE_48H,
            "images": [
                RoomImage(url="/images/rooms/deluxe-highway-2.jpg", alt="EH Deluxe Highway View Room", is_primary=True, order=1)
            ]
        },
        
        # EH Premium Rooms (5000 + GST) - 15 rooms
        *[{
            "slug": f"eh-premium-{i+1:03d}",
            "title": f"EH Premium Room - {200+i}",
            "description": "Well-appointed premium room with modern amenities and comfortable furnishing. Ideal for comfortable stays.",
            "room_type": RoomType.EH_PREMIUM,
            "amenities": STANDARD_AMENITIES + ["Premium amenities", "City view"],
            "base_price": 5000.0,
            "max_occupancy": 3,
            "bed_configuration": "1 Queen Bed",
            "room_size": "300 sq ft",
            "floor": "2nd Floor" if i < 8 else "3rd Floor",
            "view": "City View",
            "cancellation_policy": CancellationPolicy.FREE_48H,
            "images": [
                RoomImage(url=f"/images/rooms/premium-{i+1}.jpg", alt="EH Premium Room", is_primary=True, order=1)
            ]
        } for i in range(15)],
        
        # EH Superior Rooms (4000 + GST) - Small rooms - 19 rooms
        *[{
            "slug": f"eh-superior-{i+1:03d}",
            "title": f"EH Superior Room - {300+i}",
            "description": "Compact superior room with essential amenities. Perfect for budget-conscious travelers without compromising on comfort.",
            "room_type": RoomType.EH_SUPERIOR,
            "amenities": STANDARD_AMENITIES,
            "base_price": 4000.0,
            "max_occupancy": 2,
            "bed_configuration": "1 Double Bed",
            "room_size": "250 sq ft",
            "floor": "3rd Floor" if i < 10 else "4th Floor",
            "view": "Garden View",
            "cancellation_policy": CancellationPolicy.FREE_48H,
            "images": [
                RoomImage(url=f"/images/rooms/superior-{i+1}.jpg", alt="EH Superior Room", is_primary=True, order=1)
            ]
        } for i in range(19)]
    ]
    
    # Create rooms
    created_rooms = []
    for room_data in rooms_data:
        room = Room(**room_data)
        await room.insert()
        created_rooms.append(room)
        print(f"Created room: {room.title}")
    
    print(f"\nSuccessfully created {len(created_rooms)} rooms:")
    print(f"- EH Deluxe Highway View: 2 rooms @ ₹6,500 + GST")
    print(f"- EH Premium: 15 rooms @ ₹5,000 + GST") 
    print(f"- EH Superior: 19 rooms @ ₹4,000 + GST")
    print(f"Total: 36 rooms")
    print(f"\nContact: {HOTEL_CONTACT['email']}")
    print(f"Phone: {HOTEL_CONTACT['phone']}")
    
    return created_rooms

async def main():
    """Initialize database and create rooms"""
    await init_db()
    await create_rooms()

if __name__ == "__main__":
    asyncio.run(main())