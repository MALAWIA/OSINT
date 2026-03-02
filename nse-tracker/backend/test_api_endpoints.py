#!/usr/bin/env python3
"""
Comprehensive API endpoint testing script for NSE Intelligence Tracker
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(method, endpoint, data=None, headers=None, expected_status=200):
    """Test individual API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=5)
        else:
            return {"status": "error", "message": f"Unsupported method: {method}"}
        
        return {
            "status": "success" if response.status_code == expected_status else "error",
            "status_code": response.status_code,
            "endpoint": endpoint,
            "method": method,
            "response_time": response.elapsed.total_seconds(),
            "data": response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text[:200]
        }
    except requests.exceptions.RequestException as e:
        return {
            "status": "error",
            "endpoint": endpoint,
            "method": method,
            "error": str(e)
        }
    except Exception as e:
        return {
            "status": "error",
            "endpoint": endpoint,
            "method": method,
            "error": str(e)
        }

def run_tests():
    """Run all API tests"""
    print("🧪 Starting API Endpoint Tests")
    print("=" * 50)
    
    test_results = []
    
    # Test 1: Health Check
    print("\n📊 Testing Health Check...")
    result = test_endpoint("GET", "/health")
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Test 2: User Registration
    print("\n👤 Testing User Registration...")
    test_user = {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123",
        "unique_identification_code": "TEST123456789"
    }
    result = test_endpoint("POST", "/auth/register", test_user, expected_status=201)
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Test 3: User Login
    print("\n🔐 Testing User Login...")
    login_data = {
        "username": "testuser",
        "password": "testpassword123",
        "unique_identification_code": "TEST123456789"
    }
    result = test_endpoint("POST", "/auth/login", login_data)
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Test 4: Get Stocks
    print("\n📈 Testing Stocks Endpoint...")
    result = test_endpoint("GET", "/stocks/")
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Test 5: Get News
    print("\n📰 Testing News Endpoint...")
    result = test_endpoint("GET", "/news/")
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Test 6: API Documentation
    print("\n📚 Testing API Documentation...")
    result = test_endpoint("GET", "/docs")
    test_results.append(result)
    print(f"   Status: {'✅' if result['status'] == 'success' else '❌'} {result.get('status_code', 'N/A')}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    success_count = sum(1 for r in test_results if r['status'] == 'success')
    total_tests = len(test_results)
    
    print(f"✅ Successful: {success_count}/{total_tests}")
    print(f"❌ Failed: {total_tests - success_count}/{total_tests}")
    print(f"📈 Success Rate: {(success_count/total_tests)*100:.1f}%")
    
    # Show failed tests
    failed_tests = [r for r in test_results if r['status'] == 'error']
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"   {test['method']} {test['endpoint']}: {test.get('error', 'Unknown error')}")
    
    return success_count == total_tests

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
