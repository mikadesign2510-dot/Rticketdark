import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace("siteSettings?.secondSliderEnabled !== false", "siteSettings?.secondSliderEnabled === true")

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

content = content.replace("siteSettings?.mainSliderEnabled !== false", "siteSettings?.mainSliderEnabled === true")

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
print("Conditions patched")
