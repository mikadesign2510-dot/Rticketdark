import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# 1. Add import for CompactHeroSearch
if "import { CompactHeroSearch }" not in content:
    content = content.replace("import { HeroSection }", "import { CompactHeroSearch } from '../components/CompactHeroSearch';\nimport { HeroSection }")

# 2. Add CompactHeroSearch under the Intro Box (before Bento Hero)
search_box_code = """
        {/* OPTIMIZED & COMPACT SEARCH BAR (Moved from Hero) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-8 relative z-20">
          <CompactHeroSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            artistQuery={artistQuery}
            onArtistChange={setArtistQuery}
            selectedCity={selectedCity}
            onCityChange={setSelectedCity}
            cities={CITIES_LIST}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            onExecuteSearch={() => {
              const el = document.getElementById('events-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            siteSettings={siteSettings}
          />
        </div>
"""

# The introbox ends with `</motion.div>\n        )}`
content = re.sub(
    r"(</motion\.div>\s*?)}\s*?{\/\* Bento Hero Section \*\/}",
    r"\1}\n" + search_box_code + "\n        {/* Bento Hero Section */}",
    content
)

# 3. Hook up SecondSlider to siteSettings
content = content.replace(
    "<SecondSlider banners={secondBanners} siteSettings={siteSettings} />",
    "{siteSettings?.secondSliderEnabled !== false && <SecondSlider banners={secondBanners} siteSettings={siteSettings} />}"
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Home.tsx patched")
