import os
import glob

def rename_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content.replace("mainSliderEnabled", "mainSliderActive")
    new_content = new_content.replace("secondSliderEnabled", "secondSliderActive")
    new_content = new_content.replace("heroBannerEnabled", "heroBannerActive")
    
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            rename_in_file(os.path.join(root, file))

print("Rename complete")
