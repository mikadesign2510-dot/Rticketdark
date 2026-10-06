import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Remove BentoHero from Home.tsx since it's already in HeroSection
content = re.sub(
    r"\{\/\* Bento Hero Section \*\/\}\s*?\{dbEvents\.length >= 3 && \(\s*?<BentoHero.*?\/>\s*?\)\}",
    "",
    content,
    flags=re.DOTALL
)
content = content.replace("import { BentoHero } from '../components/BentoHero';\n", "")

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Duplicate BentoHero removed from Home.tsx")
