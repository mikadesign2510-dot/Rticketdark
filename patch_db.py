with open('src/lib/db.ts', 'r') as f:
    content = f.read()

content = content.replace("mainSliderEnabled: true,", "mainSliderEnabled: false,")
content = content.replace("secondSliderEnabled: true,", "secondSliderEnabled: false,")

with open('src/lib/db.ts', 'w') as f:
    f.write(content)
print("db.ts patched")
