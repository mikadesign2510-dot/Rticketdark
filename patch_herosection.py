import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { FeaturedCinemaBanner } from './FeaturedCinemaBanner';", "import { BentoHero } from './BentoHero';")

bento_hero_code = """
        {/* 1. BENTO HERO FOR FEATURED / SPECIAL PROMO EVENTS */}
        <BentoHero
          events={featuredEvents}
          onOpenDetails={onOpenDetails}
          onBuyTicket={onBuyTicket}
        />
"""

content = re.sub(
    r"\{\/\* 1\. CINEMATIC BANNER FOR FEATURED \/ SPECIAL PROMO EVENTS \*\/\}.*?<FeaturedCinemaBanner.*?siteSettings=\{siteSettings\}.*?\/>",
    bento_hero_code,
    content,
    flags=re.DOTALL
)

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
print("patched")
