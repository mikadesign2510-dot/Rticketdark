import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Find Navbar
navbar_pattern = r"(<Navbar.*?/>)"
navbar_match = re.search(navbar_pattern, content, flags=re.DOTALL)
navbar_str = navbar_match.group(1) if navbar_match else ""

# Find IntroBox
intro_pattern = r"(\{siteSettings\?\.introBoxEnabled !== false && \(\s*<motion\.div.*?</motion\.div>\s*\)\})"
intro_match = re.search(intro_pattern, content, flags=re.DOTALL)
intro_str = intro_match.group(1) if intro_match else ""

# Find Search Box
search_pattern = r"(\{\/\* OPTIMIZED & COMPACT SEARCH BAR \(Moved from Hero\) \*\/\}.*?</div>)"
search_match = re.search(search_pattern, content, flags=re.DOTALL)
search_str = search_match.group(1) if search_match else ""

# Find HeroSection
hero_pattern = r"(\{\/\* 2\. Top Cinema Banner \+ Compact Optimized Search Box \*\/\}\s*?\{siteSettings\?\.heroBannerActive !== false && <HeroSection.*?\/>\})"
hero_match = re.search(hero_pattern, content, flags=re.DOTALL)
hero_str = hero_match.group(1) if hero_match else ""

# Delete them from content to rebuild
content = content.replace(intro_str, "")
content = content.replace(search_str, "")
content = content.replace(hero_str, "")

# Re-insert in desired order right after <main className="flex-1">
new_order = f"""
        {hero_str}

        {search_str}

        {intro_str}
"""
content = content.replace('<main className="flex-1">', '<main className="flex-1">\n' + new_order)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Home.tsx reordered")
