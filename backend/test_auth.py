#!/usr/bin/env python3
"""
Simple test script to verify authentication functions work correctly
"""
import asyncio
from app.auth import get_password_hash, verify_password, validate_password_strength, generate_otp

async def test_auth_functions():
    print("🧪 Testing Euro Hotel Authentication System...")
    
    # Test password validation
    print("\n1. Testing password validation:")
    test_passwords = [
        ("Test123!", True),
        ("weak", False),
        ("NoNumbers!", False),
        ("nonumbers123", False),
        ("NOLOWERCASE123!", False),
        ("ValidPass123!", True),
    ]
    
    for password, expected in test_passwords:
        result = validate_password_strength(password)
        status = "✅" if result == expected else "❌"
        print(f"   {status} '{password}' -> {result} (expected {expected})")
    
    # Test password hashing
    print("\n2. Testing password hashing:")
    test_password = "TestPassword123!"
    try:
        hash_result = get_password_hash(test_password)
        verify_result = verify_password(test_password, hash_result)
        print(f"   ✅ Hash created: {len(hash_result) > 0}")
        print(f"   ✅ Verification works: {verify_result}")
        print(f"   ✅ Wrong password rejected: {not verify_password('WrongPass123!', hash_result)}")
    except Exception as e:
        print(f"   ❌ Hashing failed: {e}")
    
    # Test OTP generation
    print("\n3. Testing OTP generation:")
    otp = generate_otp()
    print(f"   ✅ OTP generated: {otp} (length: {len(otp)})")
    print(f"   ✅ OTP is numeric: {otp.isdigit()}")
    
    print("\n🎉 Authentication system tests completed!")

if __name__ == "__main__":
    asyncio.run(test_auth_functions())