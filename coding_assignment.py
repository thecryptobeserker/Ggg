import time
import hashlib
from getpass import getpass

curr_user = "Marist"
curr_password = hashlib.sha256("passw0rd".encode()).digest()

TOTAL_ATTEMPTS = 3

def main():
    attempts = 0

    while attempts < TOTAL_ATTEMPTS:
        username = input("Enter username: ")
        password = getpass("Enter password: ")

        # Hash the entered password and compare with the stored hash
        password_hash = hashlib.sha256(password.encode()).digest()

        if username == curr_user and password_hash == curr_password:
            print("Login successful.")
            return

        attempts += 1
        remaining = TOTAL_ATTEMPTS - attempts
        if remaining > 0:
            print(f"Invalid credentials.")
        else:
            print("Too many failed attempts.")

main()
