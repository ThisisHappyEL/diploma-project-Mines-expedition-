import os
from PIL import Image

# Главная папка с картинками
root_folder = "/mnt/d/Dev/vs-code/LearnDir/diploma-project-Mines-expedition-/public/assets/img"

if not os.path.exists(root_folder):
    print(f"Ошибка: Папка не найдена: {root_folder}")
    exit()

count = 0

# os.walk заходит во все вложенные папки автоматически
for dirpath, _, filenames in os.walk(root_folder):
    for filename in filenames:
        if filename.lower().endswith(".png"):
            png_path = os.path.join(dirpath, filename)
            webp_path = os.path.join(dirpath, os.path.splitext(filename)[0] + ".webp")
            
            try:
                # Открываем, конвертируем (сохраняя альфа-канал/прозрачность), сохраняем
                with Image.open(png_path) as img:
                    img.save(webp_path, "WEBP", quality=85, method=6)
                
                print(f"Конвертировано: {os.path.relpath(webp_path, root_folder)}")
                
                # Удаляем старый PNG
                os.remove(png_path)
                count += 1
                
            except Exception as e:
                print(f"Ошибка с файлом {filename}: {e}")

print(f"\nГотово! Всего конвертировано и удалено PNG: {count}")