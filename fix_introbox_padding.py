with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-6 relative z-10"',
    'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 relative z-10"'
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("IntroBox padding fixed")
