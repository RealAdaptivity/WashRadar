import re
import json

with open('state.js', 'r', encoding='utf-8') as f:
    content = f.read()

matches = re.findall(r'id:\s*"(wash-\d+)".*?name:\s*"([^"]+)".*?address:\s*"([^"]+)"', content, re.DOTALL)
washes = [{'id': m[0], 'name': m[1], 'address': m[2]} for m in matches]

with open('washes.json', 'w', encoding='utf-8') as f:
    json.dump(washes, f, indent=2)
