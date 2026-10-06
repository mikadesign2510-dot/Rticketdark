import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Replace the HeroSection call
old_hero_call = r"""        {siteSettings\?\.heroBannerEnabled !== false && <HeroSection
          searchQuery=\{searchQuery\}
          onSearchChange=\{setSearchQuery\}
          artistQuery=\{artistQuery\}
          onArtistChange=\{setArtistQuery\}
          selectedCity=\{selectedCity\}
          onCityChange=\{setSelectedCity\}
          dateFilter=\{dateFilter\}
          onDateFilterChange=\{setDateFilter\}
          onExecuteSearch=\{.*?\}
          totalEventsCount=\{dbEvents\.length\}
          onOpenDetails=\{setActiveModalEvent\}
          onBuyTicket=\{setActiveBookingEvent\}
          featuredEvents=\{dbEvents\}
          siteSettings=\{siteSettings\}
          banners=\{banners\}
        />}"""

new_hero_call = """        {siteSettings?.heroBannerEnabled !== false && <HeroSection
          onOpenDetails={setActiveModalEvent}
          onBuyTicket={setActiveBookingEvent}
          featuredEvents={dbEvents}
          siteSettings={siteSettings}
          banners={banners}
        />}"""

content = re.sub(old_hero_call, new_hero_call, content, flags=re.DOTALL)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Hero call in Home.tsx patched")
