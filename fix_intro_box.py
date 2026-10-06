import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace("siteSettings.introBoxBorderColor", "siteSettings?.introBoxBorderColor")
content = content.replace("siteSettings.introBoxLogoUrl", "siteSettings?.introBoxLogoUrl")
content = content.replace("siteSettings.introBoxTitle", "siteSettings?.introBoxTitle")
content = content.replace("siteSettings.introBoxLogoSize", "siteSettings?.introBoxLogoSize")
content = content.replace("siteSettings.introBoxLogoRadius", "siteSettings?.introBoxLogoRadius")
content = content.replace("siteSettings.introBoxDescription", "siteSettings?.introBoxDescription")

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("done")
