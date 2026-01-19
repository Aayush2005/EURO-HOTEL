"""
Euro Hotel Configuration
Official contact: rudraramreservations@eurohotel.in
Phone: +91 77299 00091
"""

# Hotel Information
HOTEL_INFO = {
    "name": "Euro Hotel",
    "email": "rudraramreservations@eurohotel.in",
    "phone": "+91 77299 00091",
    "address": "Euro Hotel, Opp post office Mumbai highway Rudraram village Patancheru Mandal Sangareddy Dist Telangana 502329",
    "total_rooms": 36,
    "category": "Premium"
}

# Room Pricing (Base prices before GST)
ROOM_PRICING = {
    "eh_deluxe_highway_view": {
        "base_price": 6500.0,
        "description": "EH Deluxe room Highway View",
        "gst_rate": 0.05  # 5% GST under 7500 tariff
    },
    "eh_premium": {
        "base_price": 5000.0,
        "description": "EH Premium Room",
        "gst_rate": 0.05  # 5% GST under 7500 tariff
    },
    "eh_superior": {
        "base_price": 4000.0,
        "description": "EH Superior Room (Small rooms)",
        "gst_rate": 0.05  # 5% GST under 7500 tariff
    }
}

# Additional Charges
ADDITIONAL_CHARGES = {
    "extra_bed": 1500.0,  # Extra bed in room charges
    "gst_threshold": 7500.0,  # GST 5% under 7500 tariff
    "gst_rate_under_threshold": 0.05,  # 5%
    "gst_rate_over_threshold": 0.12   # 12% (if applicable)
}

# Policies
HOTEL_POLICIES = {
    "cancellation_hours": 48,  # 48 hours before checkin
    "refund_after_gst_deduction": True,
    "room_stay_id_required": True,
    "no_outside_guests": True,
    "no_smoking_rooms": True,
    "smoking_zone_available": True,
    "check_in_time": "14:00",
    "check_out_time": "12:00"
}

# Restaurant & F&B
RESTAURANT_INFO = {
    "nh65_fine_dining": {
        "name": "nH-65 Fine Dining Restaurant",
        "location": "First floor",
        "hours": "12:00 PM to 12:00 AM",
        "covers": 220,
        "cuisine": "Multicuisine (Indian, Chinese, Continental)"
    },
    "nh65_casual_dining": {
        "name": "nH-65 Casual Dining Restaurant", 
        "hours": "7:00 AM to 12:00 AM"
    },
    "barista_cafe": {
        "name": "Barista Cafe",
        "hours": "24x7",
        "service_type": "Dine-in at Cafe only"
    },
    "room_service": {
        "name": "Room F&B Service",
        "hours": "7:00 AM to 12:00 PM"
    },
    "private_dining": [
        {"capacity": 18, "area": "Private Dining Area 1"},
        {"capacity": 15, "area": "Private Dining Area 2"}
    ],
    "additional_facilities": [
        "Mocktail Bar", "Live Kitchen", "Ice cream Parlour", 
        "Pan Counter", "Take away Counter"
    ]
}

# Services
HOTEL_SERVICES = {
    "concierge": [
        "Luxury Cabs Service", "Laundry Service", "Tour Plan with Site visits",
        "Travel help", "Ticket booking", "Group Tour Management", "Corporate Tours"
    ],
    "facilities": [
        "24x7 Cab facility", "Airport pickup & Drop (on request)",
        "Laundry facility", "WiFi", "24x7 Barista", "24x7 Room Service",
        "Butler service", "Parking", "Multicuisine Restaurant"
    ],
    "catering": [
        "Kitty parties", "Outdoor caterings", "Corporate catering", "Social events"
    ],
    "meals": ["Breakfast", "Lunch", "Hi-tea", "Dinner"]
}

# Room Amenities
ROOM_AMENITIES = {
    "standard": [
        "Mini bar", "Iron board with iron", "Tea kettle", "Television", 
        "WiFi", "Air conditioning"
    ],
    "bathroom": [
        "All toiletries", "Soap", "Conditioner", "Shampoo", "Comb", 
        "Slippers", "Bath towels", "Hand towels", "Bath robes", "Floor mats"
    ]
}

# Future Development
FUTURE_PLANS = {
    "indoor_banquet_hall": "2nd phase"
}

# Payment Gateway
PAYMENT_CONFIG = {
    "gateway": "Razorpay",
    "online_booking": True
}