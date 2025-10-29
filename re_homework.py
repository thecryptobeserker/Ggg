import re

text = "Room AB-217 is on floor 2, built in 1999."

# Use \d+ to generate one or more digits
m = re.search(r"\d+", text)

if m:
    print("Found:", m.group())  # Print the first run of digits found
else:
    print("No digits")          # Print if no digits found



#Problem 2
text = "Deadlines: 01/09/2025, 1/9/25 (bad), 21/10/2024, and 30/12/2023."

# \b makes sure word boundaries, \d{2} generates exactly two digits, / is an actual slash; \d{4} generates four digits
pattern = r"\b\d{2}/\d{2}/\d{4}\b"

dates = re.findall(pattern, text)
print(dates)

#Problem 3
import re

messy = "This sentence has too many spaces . Also odd spacing ."

# Step 1: Change any group of whitespace with a single space
step1 = re.sub(r"\s+", " ", messy)

# Step 2: Remove spaces that come right before a period
clean = re.sub(r" \.", ".", step1)

print(clean)
# Explanation: First we collapse multiple spaces, then remove any space directly before a period.

#Problem 4
import re

# Stricter email pattern: enforces proper placement of dots/dashes/underscores
pattern = r"^[A-Za-z0-9](?:[._-]?[A-Za-z0-9])*@[A-Za-z0-9](?:[-]?[A-Za-z0-9])*(?:\.[A-Za-z0-9](?:[-]?[A-Za-z0-9])*)*\.[A-Za-z]{2,}$"

emails = [
    "roger@example.com",       # True
    "first.last@marist.edu",   # True
    ".....-.@..com",           # False
    "test@domain..org",        # False
    "abc@xyz.c",               # False
]

# Print True if pattern matches, else False
for e in emails:
    print(e, "->", bool(re.fullmatch(pattern, e)))
# Matches emails with valid alphanumeric starts, proper dots/dashes, and a 2+ letter TLD.