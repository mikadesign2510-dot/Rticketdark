import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()

# 1. Remove CompactHeroSearch import
content = content.replace("import { CompactHeroSearch } from './CompactHeroSearch';\n", "")
content = content.replace("import { CITIES_LIST } from '../data/mockEvents';\n", "")

# 2. Update interface
content = re.sub(
    r"interface HeroSectionProps \{.*?\n\}",
    """interface HeroSectionProps {
  onOpenDetails: (event: ArtEvent) => void;
  onBuyTicket: (event: ArtEvent) => void;
  featuredEvents: ArtEvent[];
  siteSettings?: SiteSettings;
  banners?: HeroBanner[];
}""",
    content,
    flags=re.DOTALL
)

# 3. Update component signature
content = re.sub(
    r"export const HeroSection: React\.FC<HeroSectionProps> = \(\{.*?\}\) => \{",
    """export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDetails,
  onBuyTicket,
  featuredEvents,
  siteSettings,
  banners = [],
}) => {""",
    content,
    flags=re.DOTALL
)

# 4. Remove the <CompactHeroSearch /> usage
content = re.sub(
    r"\{\/\* 2\. OPTIMIZED & COMPACT SEARCH BAR \*\/\}.*?<CompactHeroSearch.*?/>",
    "",
    content,
    flags=re.DOTALL
)

# 5. Respect mainSliderEnabled for hasBanners
content = content.replace("const hasBanners = activeBanners.length > 0;", "const hasBanners = activeBanners.length > 0 && siteSettings?.mainSliderEnabled !== false;")

with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)
print("HeroSection.tsx patched")
