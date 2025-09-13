import rarfile
import os

# Define paths
rar_path = "D:/Original_D_Drive.rar"
dest_path = "C:/partial_extract/"

# Size to copy in bytes (300GB)
chunk_size = 1024 * 1024 * 1024  # 1GB chunk size
max_size = 300 * chunk_size       # 300GB total size

def extract_rar(rar_path, dest_path, max_size):
    with rarfile.RarFile(rar_path) as rf:
        total_bytes_copied = 0
        for file in rf.infolist():
            # Read file data in chunks
            if total_bytes_copied >= max_size:
                break
            with rf.open(file) as f:
                file_data = f.read(min(chunk_size, max_size - total_bytes_copied))
                with open(os.path.join(dest_path, file.filename), 'wb') as out:
                    out.write(file_data)
                total_bytes_copied += len(file_data)
            print(f"Copied {total_bytes_copied / (1024**3):.2f} GB")

    print(f"Partial extraction complete. Total size copied: {total_bytes_copied / (1024**3):.2f} GB")

extract_rar(rar_path, dest_path, max_size)
