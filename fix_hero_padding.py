import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

# Make HeroSection always have top padding because it's now directly under the Navbar
content = content.replace(
    "`relative w-full overflow-hidden bg-[#0A0B10] ${siteSettings?.introBoxEnabled ? 'pt-6 pb-5' : 'pt-[90px] sm:pt-[100px] pb-5'} border-b border-[#1A1D2E]/80`",
    "`relative w-full overflow-hidden bg-[#0A0B10] pt-[90px] sm:pt-[100px] pb-5 border-b border-[#1A1D2E]/80`"
)

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
print("Hero padding fixed")
