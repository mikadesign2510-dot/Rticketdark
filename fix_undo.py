import re

with open('src/components/HeroSection.tsx', 'r') as f:
    content = f.read()
content = content.replace(
    'className={`relative w-full overflow-hidden bg-[#0A0B10] pt-[90px] sm:pt-[100px] pb-0`}',
    'className={`relative w-full overflow-hidden bg-[#0A0B10] ${siteSettings?.introBoxEnabled ? \'pt-6 pb-5\' : \'pt-[90px] sm:pt-[100px] pb-5\'} border-b border-[#1A1D2E]/80`}'
)
content = content.replace(
    ') : null}',
    ') : (\n          (siteSettings?.heroTitle || siteSettings?.heroSubtitle) && (\n            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-4">\n              {siteSettings?.heroTitle && (\n                <h1 className="font-display font-black text-3xl sm:text-5xl text-white mb-4 drop-shadow-lg">\n                  {siteSettings.heroTitle}\n                </h1>\n              )}\n              {siteSettings?.heroSubtitle && (\n                <p className="text-zinc-300 text-sm sm:text-lg max-w-2xl mx-auto drop-shadow-md">\n                  {siteSettings.heroSubtitle}\n                </p>\n              )}\n            </div>\n          )\n        )}'
)
with open('src/components/HeroSection.tsx', 'w') as f:
    f.write(content)

with open('src/components/BentoHero.tsx', 'r') as f:
    content = f.read()
content = content.replace(
    'className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-0"',
    'className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10"'
)
with open('src/components/BentoHero.tsx', 'w') as f:
    f.write(content)

