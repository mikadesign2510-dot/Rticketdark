with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8 relative z-20"',
    'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8 relative z-20"'
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Margin fixed")
