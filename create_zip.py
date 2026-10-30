import os
import zipfile

OUTPUT_ZIP = os.path.abspath('public/YB-with-Gwa-mar-nyi-source-code.zip')
ROOT_DIR = os.path.abspath('.')

IGNORE_DIRS = {
    'node_modules',
    '.git',
    '.aistudio',
    'dist',
    'android-build',
    '.cache',
    '__pycache__'
}

print("Creating ZIP file...")
with zipfile.ZipFile(OUTPUT_ZIP, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(ROOT_DIR):
        # Filter directories in-place to avoid traversing them
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

        for file in files:
            # Skip the zip itself and temporary files
            if file.endswith('.zip') or file.endswith('.pyc'):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            zipf.write(full_path, rel_path)

size_mb = os.path.getsize(OUTPUT_ZIP) / (1024 * 1024)
print(f"Success! Created {OUTPUT_ZIP} ({size_mb:.2f} MB)")
