import os
import zipfile
import sys

def make_zip(output_path):
    exclude_dirs = {'node_modules', 'dist', '.git', '__pycache__', '.aistudio'}
    exclude_files = {'.DS_Store'}

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for file in files:
                if file in exclude_files or file.endswith('.pyc'):
                    continue
                file_path = os.path.join(root, file)
                archive_name = os.path.relpath(file_path, '.')
                zipf.write(file_path, archive_name)

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/hublivo-fullstack-app.zip'
    make_zip(out)
    print(f"Created {out}")
