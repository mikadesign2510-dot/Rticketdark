import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace("{false && siteSettings?.heroBannerEnabled !== false && <HeroSection", "{siteSettings?.heroBannerEnabled !== false && <HeroSection")

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("unpatched")
