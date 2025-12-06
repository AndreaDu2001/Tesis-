#!/usr/bin/env python3
"""
Script para probar el sistema de autenticación completo.
"""

import requests
import time
import json
import pytest

# Este archivo es un script standalone para pruebas manuales del backend.
# Pytest lo ignora porque está diseñado para ejecutarse con `python test_auth_system.py`.
pytest.skip("Este archivo se ejecuta como script; no forma parte de la suite pytest.", allow_module_level=True)

# URL del backend
BASE_URL = "http://localhost:8000"

def test_registration():
    """Probar el registro de un nuevo usuario."""
    print("\n🔍 Probando registro de usuario...")
    
    registration_data = {
        "email": "test@wasteapp.com",
        "password": "test123456",
        "confirm_password": "test123456",
        "phone": "+593987654321",
        "first_name": "Usuario",
        "last_name": "Prueba",
        "role": "user"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/register/",
            json=registration_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Registro exitoso!")
            print(f"Usuario ID: {data.get('user', {}).get('id')}")
            print(f"Email: {data.get('user', {}).get('email')}")
            return True
        else:
            print(f"❌ Error en registro: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_login():
    """Probar el login de usuario."""
    print("\n🔍 Probando login de usuario...")
    
    login_data = {
        "email": "test@wasteapp.com",
        "password": "test123456"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login/",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login exitoso!")
            print(f"Access Token: {data.get('access', '')[:50]}...")
            print(f"Usuario: {data.get('user', {}).get('email')}")
            return data.get('access')
        else:
            print(f"❌ Error en login: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_profile(access_token):
    """Probar acceso al perfil con token."""
    print("\n🔍 Probando acceso al perfil...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/profile/",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Acceso al perfil exitoso!")
            print(f"Email: {data.get('email')}")
            print(f"Rol: {data.get('role')}")
            print(f"Fecha de registro: {data.get('date_joined')}")
            return True
        else:
            print(f"❌ Error accediendo al perfil: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_otp():
    """Probar el sistema OTP."""
    print("\n🔍 Probando sistema OTP...")
    
    otp_data = {
        "email": "test@wasteapp.com"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/otp/request/",
            json=otp_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Solicitud de OTP exitosa!")
            print("📱 Código OTP enviado por email")
            return True
        else:
            print(f"❌ Error en OTP: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    """Función principal para ejecutar todas las pruebas."""
    print("🚀 Iniciando pruebas del sistema de autenticación")
    print("=" * 50)
    
    # Esperar que los servicios estén listos
    print("⏳ Esperando que el backend esté listo...")
    time.sleep(3)
    
    # Ejecutar pruebas
    results = []
    
    # Test 1: Registro
    results.append(test_registration())
    
    # Test 2: Login
    access_token = test_login()
    results.append(access_token is not None)
    
    # Test 3: Perfil (si login fue exitoso)
    if access_token:
        results.append(test_profile(access_token))
    else:
        results.append(False)
    
    # Test 4: OTP
    results.append(test_otp())
    
    # Resumen
    print("\n" + "=" * 50)
    print("📊 Resumen de pruebas:")
    tests = ["Registro", "Login", "Perfil", "OTP"]
    
    for i, (test, result) in enumerate(zip(tests, results)):
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{test}: {status}")
    
    passed = sum(results)
    total = len(results)
    print(f"\nResultado final: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("🎉 ¡Todas las pruebas pasaron! El sistema está funcionando correctamente.")
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar logs para más detalles.")

if __name__ == "__main__":
    main()