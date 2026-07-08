import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to handle both single/double quotes and backticks.
    # Case 1: 'http://localhost:8000/api/...' or "http://localhost:8000/api/..."
    # We replace 'http://localhost:8000/api/...' with `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/...`
    
    # regex to match: 'http://localhost:8000' or "http://localhost:8000" or `http://localhost:8000`
    
    # First, let's just replace http://localhost:8000 inside string literals by transforming the whole literal to a template literal if it isn't one already.
    # Actually, a simpler robust way is to find:
    # 'http://localhost:8000/api/foo' -> `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/foo`
    
    def replacer(match):
        quote = match.group(1)
        rest = match.group(2)
        # If it's already a backtick string, just inject the variable
        if quote == '`':
            return f"`${{import.meta.env.VITE_API_URL || 'http://localhost:8000'}}{rest}`"
        else:
            # Change quotes to backticks and inject
            return f"`${{import.meta.env.VITE_API_URL || 'http://localhost:8000'}}{rest}`"

    new_content = re.sub(r'([\'"\`])http://localhost:8000(.*?)\1', replacer, content)
    
    # There is also one edge case where it might be `http://localhost:8000...${var}`. 
    # Wait, the regex `([\'"\`])http://localhost:8000(.*?)\1` handles that if .*? captures everything up to the matching quote.
    # But .*? is lazy. It might stop at the first quote if there's an embedded one.
    # In JS, string literals don't span multiple lines unless backticks. 

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    src_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'src')
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                process_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
