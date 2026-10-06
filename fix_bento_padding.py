with open('src/components/BentoHero.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10"',
    'className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8 lg:pb-10"'
)

with open('src/components/BentoHero.tsx', 'w') as f:
    f.write(content)
print("BentoHero padding fixed")
