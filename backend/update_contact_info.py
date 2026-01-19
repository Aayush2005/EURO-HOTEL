"""
Update Euro Hotel contact information throughout the system
Official contact: rudraramreservations@eurohotel.in
Phone: +91 77299 00091
"""
import os
import re

# New contact information
NEW_CONTACT = {
    "email": "rudraramreservations@eurohotel.in",
    "phone": "+91 77299 00091",
    "address": "Euro Hotel, Opp post office Mumbai highway Rudraram village Patancheru Mandal Sangareddy Dist Telangana 502329"
}

def update_files():
    """Update contact information in configuration files"""
    
    # Files to update
    files_to_update = [
        "app/config.py",
        "../frontend/.env.local",
        "../frontend/.env.local.example",
        "../frontend/src/config/constants.ts",
        "../frontend/src/components/Footer.tsx",
        "../frontend/src/components/ContactInfo.tsx"
    ]
    
    print("Updating contact information in system files...")
    print(f"New email: {NEW_CONTACT['email']}")
    print(f"New phone: {NEW_CONTACT['phone']}")
    print(f"New address: {NEW_CONTACT['address']}")
    print()
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            print(f"✓ Found: {file_path}")
        else:
            print(f"✗ Not found: {file_path}")
    
    print("\nPlease manually update the following:")
    print("1. Frontend environment files (.env.local)")
    print("2. Contact components in React")
    print("3. Email templates")
    print("4. Configuration files")
    print("5. Documentation files")

if __name__ == "__main__":
    update_files()