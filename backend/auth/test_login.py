#!/usr/bin/env python3
import bcrypt

# Тестируемый пароль
password = "admin"

# Несколько вариантов хешей
hashes = [
    "$2b$12$KIXn7VDyW7d3hUOjKqF7eeQsYVPE.3d9V0gYpXnJKHZvJR8C2Vbsu",
    "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36pqZxfAh1kWNxA8lfKz3Qu",
]

print(f"Testing password: '{password}'")
print()

for i, hash_str in enumerate(hashes, 1):
    try:
        result = bcrypt.checkpw(password.encode('utf-8'), hash_str.encode('utf-8'))
        print(f"Hash {i}: {result} ✓" if result else f"Hash {i}: {result} ✗")
    except Exception as e:
        print(f"Hash {i}: ERROR - {e}")

print()
print("Generating new hash for 'admin':")
new_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
print(new_hash)
print(f"Verification: {bcrypt.checkpw(password.encode('utf-8'), new_hash.encode('utf-8'))}")
