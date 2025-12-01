from datetime import datetime

timenow = datetime.now()

timestampnow = int(timenow.strftime("%m%d%Y%H%M%S%f"))
ivmultiplier = int(input("Multiplier: "))
iv = timestampnow * ivmultiplier
print("Timestamp #:", timestampnow)
print("IV #:", iv)
