#!/usr/bin/env python3
"""
Seed script to populate the database with EURO HOTEL rooms
"""
import asyncio
from datetime import datetime
from app.database import connect_to_mongo
from app.models.booking import Room, RoomType, CancellationPolicy, RoomImage

async def seed_rooms():
    """Seed the database with EURO HOTEL rooms"""
    print("🏨 Seeding EURO HOTEL rooms...")
    
    # Connect to database
    await connect_to_mongo()
    
    # Clear existing rooms
    await Room.delete_all()
    print("🗑️  Cleared existing rooms")
    
    # Define room data
    rooms_data = [
        {
            "slug": "standard-heritage-room",
            "title": "Standard Heritage Room",
            "description": "Experience the charm of our heritage building in this comfortable standard room featuring traditional decor with modern amenities. Perfect for solo travelers or couples seeking an authentic stay.",
            "room_type": RoomType.STANDARD,
            "amenities": [
                "Free WiFi", "Air Conditioning", "LED TV", "Tea/Coffee Maker", 
                "Heritage View", "Attached Bathroom", "Room Service", "Daily Housekeeping"
            ],
            "images": [
                RoomImage(url="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop", alt="Standard Heritage Room - Main View", is_primary=True, order=1),
                RoomImage(url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop", alt="Standard Heritage Room - Bathroom", is_primary=False, order=2),
                RoomImage(url="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop", alt="Standard Heritage Room - Heritage View", is_primary=False, order=3),
                RoomImage(url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop", alt="Standard Heritage Room - Seating Area", is_primary=False, order=4),
            ],
            "base_price": 8500.0,
            "max_occupancy": 2,
            "bed_configuration": "1 Queen Bed",
            "room_size": "25 sqm",
            "floor": "1st & 2nd Floor",
            "view": "Heritage Courtyard",
            "cancellation_policy": CancellationPolicy.FREE_24H,
            "metadata": {
                "total_rooms": 8,
                "room_numbers": ["101", "102", "103", "104", "201", "202", "203", "204"]
            }
        },
        {
            "slug": "deluxe-heritage-room",
            "title": "Deluxe Heritage Room",
            "description": "Spacious and elegantly appointed deluxe room combining heritage architecture with contemporary luxury. Features premium furnishings and enhanced amenities for a memorable stay.",
            "room_type": RoomType.DELUXE,
            "amenities": [
                "Free WiFi", "Air Conditioning", "Smart TV", "Mini Bar", "Tea/Coffee Maker",
                "Heritage View", "Premium Bathroom", "Balcony", "Room Service", "Daily Housekeeping",
                "Complimentary Breakfast", "Newspaper"
            ],
            "images": [
                RoomImage(url="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop", alt="Deluxe Heritage Room - Main View", is_primary=True, order=1),
                RoomImage(url="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop", alt="Deluxe Heritage Room - Seating Area", is_primary=False, order=2),
                RoomImage(url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop", alt="Deluxe Heritage Room - Balcony View", is_primary=False, order=3),
                RoomImage(url="https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop", alt="Deluxe Heritage Room - Premium Bathroom", is_primary=False, order=4),
                RoomImage(url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop", alt="Deluxe Heritage Room - Mini Bar", is_primary=False, order=5),
            ],
            "base_price": 12500.0,
            "max_occupancy": 3,
            "bed_configuration": "1 King Bed + 1 Sofa Bed",
            "room_size": "35 sqm",
            "floor": "2nd & 3rd Floor",
            "view": "Heritage Courtyard & Garden",
            "cancellation_policy": CancellationPolicy.FREE_24H,
            "metadata": {
                "total_rooms": 6,
                "room_numbers": ["205", "206", "301", "302", "303", "304"]
            }
        },
        {
            "slug": "heritage-suite",
            "title": "Heritage Suite",
            "description": "Luxurious suite showcasing the grandeur of our heritage property. Features separate living area, premium amenities, and panoramic views. Ideal for special occasions and extended stays.",
            "room_type": RoomType.SUITE,
            "amenities": [
                "Free WiFi", "Air Conditioning", "Smart TV", "Premium Mini Bar", "Espresso Machine",
                "Heritage View", "Luxury Bathroom", "Private Balcony", "Separate Living Area",
                "Room Service", "Daily Housekeeping", "Complimentary Breakfast", "Newspaper",
                "Welcome Amenities", "Turndown Service", "Bathrobe & Slippers"
            ],
            "images": [
                RoomImage(url="https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop", alt="Heritage Suite - Living Area", is_primary=True, order=1),
                RoomImage(url="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop", alt="Heritage Suite - Bedroom", is_primary=False, order=2),
                RoomImage(url="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop", alt="Heritage Suite - Private Balcony", is_primary=False, order=3),
                RoomImage(url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop", alt="Heritage Suite - Luxury Bathroom", is_primary=False, order=4),
                RoomImage(url="https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop", alt="Heritage Suite - Dining Area", is_primary=False, order=5),
                RoomImage(url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop", alt="Heritage Suite - Heritage View", is_primary=False, order=6),
            ],
            "base_price": 18500.0,
            "max_occupancy": 4,
            "bed_configuration": "1 King Bed + 1 Sofa Bed",
            "room_size": "55 sqm",
            "floor": "3rd Floor",
            "view": "Panoramic Heritage & Garden View",
            "cancellation_policy": CancellationPolicy.FLEXIBLE,
            "metadata": {
                "total_rooms": 4,
                "room_numbers": ["305", "306", "307", "308"]
            }
        },
        {
            "slug": "presidential-suite",
            "title": "Presidential Suite",
            "description": "The pinnacle of luxury at EURO HOTEL. This magnificent suite offers unparalleled elegance with separate bedroom, living room, dining area, and premium services. Perfect for VIPs and special celebrations.",
            "room_type": RoomType.PRESIDENTIAL,
            "amenities": [
                "Free WiFi", "Air Conditioning", "Premium Smart TV", "Fully Stocked Mini Bar",
                "Espresso Machine", "Heritage View", "Luxury Bathroom with Jacuzzi", "Private Terrace",
                "Separate Living Room", "Dining Area", "Kitchenette", "Room Service", "Butler Service",
                "Daily Housekeeping", "Complimentary Breakfast", "Newspaper", "Welcome Amenities",
                "Turndown Service", "Premium Bathrobe & Slippers", "Fresh Flowers", "Fruit Basket"
            ],
            "images": [
                RoomImage(url="https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop", alt="Presidential Suite - Grand Living Room", is_primary=True, order=1),
                RoomImage(url="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop", alt="Presidential Suite - Master Bedroom", is_primary=False, order=2),
                RoomImage(url="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop", alt="Presidential Suite - Private Terrace", is_primary=False, order=3),
                RoomImage(url="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop", alt="Presidential Suite - Luxury Bathroom", is_primary=False, order=4),
                RoomImage(url="https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop", alt="Presidential Suite - Dining Area", is_primary=False, order=5),
                RoomImage(url="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop", alt="Presidential Suite - Kitchenette", is_primary=False, order=6),
                RoomImage(url="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop", alt="Presidential Suite - Heritage View", is_primary=False, order=7),
            ],
            "base_price": 35000.0,
            "max_occupancy": 6,
            "bed_configuration": "1 King Bed + 2 Sofa Beds",
            "room_size": "85 sqm",
            "floor": "4th Floor",
            "view": "360° Heritage & City View",
            "cancellation_policy": CancellationPolicy.FLEXIBLE,
            "metadata": {
                "total_rooms": 2,
                "room_numbers": ["401", "402"]
            }
        }
    ]
    
    # Create rooms
    created_rooms = []
    for room_data in rooms_data:
        room = Room(**room_data)
        await room.insert()
        created_rooms.append(room)
        print(f"✅ Created room: {room.title}")
    
    print(f"\n🎉 Successfully seeded {len(created_rooms)} rooms!")
    print("\nRoom Summary:")
    for room in created_rooms:
        print(f"  • {room.title} ({room.room_type.value}) - ₹{room.base_price:,.0f}/night")
    
    print(f"\n📊 Total rooms available: {sum([room.metadata.get('total_rooms', 1) for room in created_rooms])}")

if __name__ == "__main__":
    asyncio.run(seed_rooms())