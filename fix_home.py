import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const filteredEvents = useMemo(() => {',
    '''const categoryCounts = useMemo(() => {
    const counts = { all: dbEvents.length } as Record<EventCategory, number>;
    dbEvents.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [dbEvents]);

  const filteredEvents = useMemo(() => {'''
)

content = content.replace(
    '''<LinearCategoryBoxes 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
            siteSettings={siteSettings!} 
          />''',
    '''<LinearCategoryBoxes 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
            categoryCounts={categoryCounts}
          />'''
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)

print("Home.tsx patched")
