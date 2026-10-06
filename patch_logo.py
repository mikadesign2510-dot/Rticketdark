import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Replace the condition `{siteSettings?.introBoxLogoUrl && (`
# with `{ (siteSettings?.introBoxLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&h=256&auto=format&fit=crop') && (`
content = content.replace("{siteSettings?.introBoxLogoUrl && (", "{ (siteSettings?.introBoxLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&h=256&auto=format&fit=crop') && (")

content = content.replace("src={siteSettings?.introBoxLogoUrl}", "src={siteSettings?.introBoxLogoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&h=256&auto=format&fit=crop'}")

content = content.replace("borderRadius: siteSettings?.introBoxLogoRadius || '0px'", "borderRadius: siteSettings?.introBoxLogoRadius || '100%'")

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("done")
