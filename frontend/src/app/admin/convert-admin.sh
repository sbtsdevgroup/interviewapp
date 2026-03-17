#!/bin/bash
# Convert admincode.tsx to Next.js with purple theme
python3 << 'PYTHON'
import re

with open('/root/interviewapp/admincode.tsx', 'r') as f:
    content = f.read()

# Update brand colors
content = re.sub(r'blueDark:\s*"#004A99"', 'purpleDark: "#6B21A8"', content)
content = re.sub(r'blue:\s*"#0070C0"', 'purple: "#9333EA"', content)
content = re.sub(r'gold:\s*"#D4AF37"', 'purpleLight: "#A855F7"', content)
content = re.sub(r'goldSoft:\s*"#F4E7B2"', 'purpleSoft: "#E9D5FF"', content)

# Update BRAND references
content = re.sub(r'BRAND\.blueDark', 'BRAND.purpleDark', content)
content = re.sub(r'BRAND\.blue', 'BRAND.purple', content)
content = re.sub(r'BRAND\.gold', 'BRAND.purpleLight', content)
content = re.sub(r'BRAND\.goldSoft', 'BRAND.purpleSoft', content)

# Update color hex codes in gradients and styles
content = re.sub(r'#004A99', '#6B21A8', content)
content = re.sub(r'#0070C0', '#9333EA', content)
content = re.sub(r'#D4AF37', '#A855F7', content)
content = re.sub(r'#F4E7B2', '#E9D5FF', content)

# Update rgba colors in gradients
content = re.sub(r'rgba\(0,74,153,', 'rgba(107,33,168,', content)
content = re.sub(r'rgba\(0,112,192,', 'rgba(147,51,234,', content)
content = re.sub(r'rgba\(212,175,55,', 'rgba(168,85,247,', content)
content = re.sub(r'rgba\(244,231,178,', 'rgba(233,213,255,', content)

# Update imports
content = content.replace('from "@/components/ui/', 'from "@/lib/components/ui/')

# Add 'use client' at the top
if not content.startswith("'use client';"):
    content = "'use client';\n\n" + content

with open('/root/interviewapp/frontend/app/admin/page.tsx', 'w') as f:
    f.write(content)

print("Conversion complete!")
PYTHON
