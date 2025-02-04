import os
from PIL import Image

def generate_icons(input_image_path, output_dir):
    # Ensure the output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Open the input image
    with Image.open(input_image_path) as img:
        # Define the sizes for the icons
        sizes = [16, 32, 48, 128]

        for size in sizes:
            # Resize the image
            resized_img = img.resize((size, size), Image.LANCZOS)

            # Save the resized image
            output_path = os.path.join(output_dir, f'icon{size}.png')
            resized_img.save(output_path, 'PNG')

    print(f"Icons generated and saved in {output_dir}")

# Example usage
input_image_path = 'icon_base.png'
output_dir = 'icons'
generate_icons(input_image_path, output_dir)
