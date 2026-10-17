import os
from collections import deque
import numpy as np
from PIL import Image

BASE_DIR = 'd:/GAME/SOH'
SRC_1448 = os.path.join(BASE_DIR, 'asset/1448x1086')
SRC_1254 = os.path.join(BASE_DIR, 'asset/1254x1254')
OUT_DIR = os.path.join(BASE_DIR, 'asset')

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def autocrop(img):
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def slice_horizontal_segments(img):
    alpha = np.array(img)[:, :, 3]
    col_has_alpha = (alpha > 0).any(axis=0)
    segs = []
    in_s = False
    start = 0
    for i, has in enumerate(col_has_alpha):
        if has and not in_s:
            in_s = True
            start = i
        elif not has and in_s:
            in_s = False
            segs.append((start, i))
    if in_s:
        segs.append((start, len(col_has_alpha)))
    
    slices = []
    for s0, s1 in segs:
        cropped = img.crop((s0, 0, s1, img.height))
        slices.append(autocrop(cropped))
    return slices

def process_characters():
    print("Processing characters...")
    out_char_dir = os.path.join(OUT_DIR, 'characters')
    out_portrait_dir = os.path.join(out_char_dir, 'portraits')
    ensure_dir(out_char_dir)
    ensure_dir(out_portrait_dir)

    bust_boxes = {
        'joni': (80, 25, 230, 175),
        'bima': (75, 25, 235, 185),
        'nara': (75, 25, 235, 185),
        'suri': (60, 20, 240, 200),
        'kiko': (50, 40, 250, 240)
    }

    for char in ['joni', 'bima', 'nara', 'suri', 'kiko']:
        src_path = os.path.join(SRC_1254, f'{char}.png')
        im = Image.open(src_path).convert('RGBA')
        
        # 4x4 uniform 313x313 grid (1252x1252)
        sheet = im.crop((0, 0, 1252, 1252))
        sheet_path = os.path.join(out_char_dir, f'{char}_spritesheet.png')
        sheet.save(sheet_path, 'PNG')
        print(f"  Saved {sheet_path} (1252x1252, 4x4 @ 313x313)")

        # Portrait bust
        f0 = sheet.crop((0, 0, 313, 313))
        box = bust_boxes[char]
        bust = f0.crop(box).resize((256, 256), Image.Resampling.LANCZOS)
        bust_path = os.path.join(out_portrait_dir, f'{char}_bust.png')
        bust.save(bust_path, 'PNG')
        print(f"  Saved {bust_path} (256x256)")

def process_buildings():
    print("Processing buildings...")
    out_dir = os.path.join(OUT_DIR, 'building')
    ensure_dir(out_dir)

    mapping = {
        'joni_cottage.png': (SRC_1254, '7.png'),
        'cottage_interior.png': (SRC_1448, '12.png'),
        'nara_stall.png': (SRC_1254, '6.png'),
        'bima_workshop.png': (SRC_1254, '9.png'),
        'suri_pavilion.png': (SRC_1254, '8.png'),
        'forest_gateway.png': (SRC_1254, '10.png'),
        'joni_bed.png': (SRC_1254, '16.png'),
        'plant_pot.png': (SRC_1254, '15.png'),
        'woven_rug.png': (SRC_1254, '18.png'),
        'wall_shelf.png': (SRC_1254, '17.png')
    }

    for target_name, (src_folder, src_file) in mapping.items():
        im = Image.open(os.path.join(src_folder, src_file)).convert('RGBA')
        cropped = autocrop(im)
        target_path = os.path.join(out_dir, target_name)
        cropped.save(target_path, 'PNG')
        print(f"  Saved {target_name}: {cropped.size}")

def process_terrain():
    print("Processing terrain...")
    out_dir = os.path.join(OUT_DIR, 'terrain')
    ensure_dir(out_dir)

    # 1. Grass tile (1448x1086/11.png)
    im_grass = Image.open(os.path.join(SRC_1448, '11.png')).convert('RGBA')
    autocrop(im_grass).save(os.path.join(out_dir, 'grass_tile_sheet.png'), 'PNG')
    # Single clean grass tile (col 0, row 0: x in 28..367, y in 89..288)
    tile_grass = autocrop(im_grass.crop((28, 89, 367, 288)))
    tile_grass.save(os.path.join(out_dir, 'grass_tile.png'), 'PNG')
    print(f"  Saved grass_tile.png: {tile_grass.size}")

    # 2. Dirt path (1448x1086/10.png)
    im_path = Image.open(os.path.join(SRC_1448, '10.png')).convert('RGBA')
    autocrop(im_path).save(os.path.join(out_dir, 'dirt_path_sheet.png'), 'PNG')
    # Single dirt path tile (col 0, row 0: x in 8..353, y in 117..331)
    tile_path = autocrop(im_path.crop((8, 117, 353, 331)))
    tile_path.save(os.path.join(out_dir, 'dirt_path_tile.png'), 'PNG')
    print(f"  Saved dirt_path_tile.png: {tile_path.size}")

    # 3. Farmland plots (1448x1086/7.png)
    im_plots = Image.open(os.path.join(SRC_1448, '7.png')).convert('RGBA')
    autocrop(im_plots).save(os.path.join(out_dir, 'farmland_plots.png'), 'PNG')
    plot_slices = slice_horizontal_segments(im_plots)
    if len(plot_slices) >= 3:
        plot_slices[0].save(os.path.join(out_dir, 'plot_untilled.png'), 'PNG')
        plot_slices[1].save(os.path.join(out_dir, 'plot_tilled.png'), 'PNG')
        plot_slices[2].save(os.path.join(out_dir, 'plot_watered.png'), 'PNG')
        print(f"  Saved 3 farm plots: {plot_slices[0].size}, {plot_slices[1].size}, {plot_slices[2].size}")

    # 4. Water & Mine & Pier
    autocrop(Image.open(os.path.join(SRC_1448, '9.png')).convert('RGBA')).save(os.path.join(out_dir, 'pond_water_tile.png'), 'PNG')
    autocrop(Image.open(os.path.join(SRC_1448, '8.png')).convert('RGBA')).save(os.path.join(out_dir, 'mine_cave_tile.png'), 'PNG')
    autocrop(Image.open(os.path.join(SRC_1254, '14.png')).convert('RGBA')).save(os.path.join(out_dir, 'fishing_pier.png'), 'PNG')
    print("  Saved pond_water, mine_cave, fishing_pier")

def process_nature():
    print("Processing nature...")
    out_dir = os.path.join(OUT_DIR, 'nature')
    ensure_dir(out_dir)

    # Trees & fallen log
    autocrop(Image.open(os.path.join(SRC_1254, '11.png')).convert('RGBA')).save(os.path.join(out_dir, 'tree_tropical_large.png'), 'PNG')
    autocrop(Image.open(os.path.join(SRC_1254, '12.png')).convert('RGBA')).save(os.path.join(out_dir, 'tree_slender_medium.png'), 'PNG')
    autocrop(Image.open(os.path.join(SRC_1254, '13.png')).convert('RGBA')).save(os.path.join(out_dir, 'fallen_log.png'), 'PNG')

    # Foliage bushes (1448x1086/6.png)
    im_bushes = Image.open(os.path.join(SRC_1448, '6.png')).convert('RGBA')
    autocrop(im_bushes).save(os.path.join(out_dir, 'foliage_bushes.png'), 'PNG')
    bush_slices = slice_horizontal_segments(im_bushes)
    for idx, b in enumerate(bush_slices):
        b.save(os.path.join(out_dir, f'foliage_bush_{idx+1}.png'), 'PNG')
    print(f"  Saved {len(bush_slices)} foliage bushes")

    # Mining ore node (1448x1086/5.png)
    im_ore = Image.open(os.path.join(SRC_1448, '5.png')).convert('RGBA')
    autocrop(im_ore).save(os.path.join(out_dir, 'mining_ore_node.png'), 'PNG')
    ore_slices = slice_horizontal_segments(im_ore)
    if len(ore_slices) >= 3:
        ore_slices[0].save(os.path.join(out_dir, 'ore_node_intact.png'), 'PNG')
        ore_slices[1].save(os.path.join(out_dir, 'ore_node_cracked.png'), 'PNG')
        ore_slices[2].save(os.path.join(out_dir, 'ore_node_depleted.png'), 'PNG')
    print(f"  Saved 3 ore node stages")

    # Forest foraging node (1448x1086/4.png)
    im_forage = Image.open(os.path.join(SRC_1448, '4.png')).convert('RGBA')
    autocrop(im_forage).save(os.path.join(out_dir, 'forest_foraging_node.png'), 'PNG')
    forage_slices = slice_horizontal_segments(im_forage)
    if len(forage_slices) >= 3:
        forage_slices[0].save(os.path.join(out_dir, 'forage_mushroom.png'), 'PNG')
        forage_slices[1].save(os.path.join(out_dir, 'forage_vine.png'), 'PNG')
        forage_slices[2].save(os.path.join(out_dir, 'forage_twig.png'), 'PNG')
    print(f"  Saved 3 forage nodes")

    # Harvest lantern (1254x1254/19.png)
    im_lantern = Image.open(os.path.join(SRC_1254, '19.png')).convert('RGBA')
    autocrop(im_lantern).save(os.path.join(out_dir, 'harvest_lantern.png'), 'PNG')
    lantern_slices = slice_horizontal_segments(im_lantern)
    if len(lantern_slices) >= 2:
        lantern_slices[0].save(os.path.join(out_dir, 'lantern_unlit.png'), 'PNG')
        lantern_slices[1].save(os.path.join(out_dir, 'lantern_lit.png'), 'PNG')
    print(f"  Saved 2 lantern states")

def process_crops():
    print("Processing crops...")
    out_dir = os.path.join(OUT_DIR, 'crops')
    ensure_dir(out_dir)

    crops = {
        'crop_mossberry': (SRC_1448, '1.png'),
        'crop_sunroot': (SRC_1448, '2.png'),
        'crop_goldenleaf': (SRC_1448, '3.png')
    }

    for crop_name, (src_folder, src_file) in crops.items():
        im = Image.open(os.path.join(src_folder, src_file)).convert('RGBA')
        autocrop(im).save(os.path.join(out_dir, f'{crop_name}.png'), 'PNG')
        stages = slice_horizontal_segments(im)
        for idx, stage in enumerate(stages):
            stage.save(os.path.join(out_dir, f'{crop_name}_stage{idx+1}.png'), 'PNG')
        print(f"  Saved {crop_name} with {len(stages)} stages")

def process_items():
    print("Processing items and tools...")
    out_dir = os.path.join(OUT_DIR, 'items')
    ensure_dir(out_dir)

    # 1. Tools (1448x1086/16.png)
    im_tools = Image.open(os.path.join(SRC_1448, '16.png')).convert('RGBA')
    autocrop(im_tools).save(os.path.join(out_dir, 'tools_set.png'), 'PNG')
    
    # Tool 1: hoe (x in 27..341)
    tool_hoe = autocrop(im_tools.crop((27, 0, 345, im_tools.height)))
    tool_hoe.save(os.path.join(out_dir, 'tool_hoe.png'), 'PNG')

    # Tool 2: watering can (x in 367..706)
    tool_can = autocrop(im_tools.crop((367, 0, 715, im_tools.height)))
    tool_can.save(os.path.join(out_dir, 'tool_watering_can.png'), 'PNG')

    # Tool 3 & 4: reinforced can & fishing rod (disjoint components in x > 720)
    arr_alpha = np.array(im_tools)[:, :, 3] > 0
    visited = np.zeros_like(arr_alpha, dtype=bool)
    q = deque([(500, 800)])
    visited[500, 800] = True
    while q:
        y, x = q.popleft()
        for dy, dx in [(-1,0), (1,0), (0,-1), (0,1), (-1,-1), (-1,1), (1,-1), (1,1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < arr_alpha.shape[0] and 0 <= nx < arr_alpha.shape[1]:
                if arr_alpha[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
    
    y_can, x_can = np.where(visited)
    tool_can_reinf = im_tools.crop((x_can.min(), y_can.min(), x_can.max() + 1, y_can.max() + 1))
    tool_can_reinf.save(os.path.join(out_dir, 'tool_reinforced_can.png'), 'PNG')

    remaining = arr_alpha.copy()
    remaining[visited] = False
    y_rod, x_rod = np.where(remaining[:, 720:])
    x_rod_min = x_rod.min() + 720
    x_rod_max = x_rod.max() + 720
    tool_rod = im_tools.crop((x_rod_min, y_rod.min(), x_rod_max + 1, y_rod.max() + 1))
    tool_rod.save(os.path.join(out_dir, 'tool_fishing_rod.png'), 'PNG')
    print("  Saved 4 tools: hoe, can, reinforced_can, fishing_rod")

    # 2. Raw materials (1448x1086/15.png)
    im_raw = Image.open(os.path.join(SRC_1448, '15.png')).convert('RGBA')
    autocrop(im_raw).save(os.path.join(out_dir, 'raw_materials.png'), 'PNG')
    raw_slices = slice_horizontal_segments(im_raw)
    raw_names = [
        'item_sunroot.png',
        'item_mossberry.png',
        'item_goldenleaf.png',
        'item_wood.png',
        'item_stone.png',
        'item_ore.png',
        'item_riverfish.png'
    ]
    for idx, name in enumerate(raw_names):
        if idx < len(raw_slices):
            raw_slices[idx].save(os.path.join(out_dir, name), 'PNG')
    print(f"  Saved {len(raw_names)} raw material items")

    # 3. Crafted items (1448x1086/14.png)
    im_craft = Image.open(os.path.join(SRC_1448, '14.png')).convert('RGBA')
    autocrop(im_craft).save(os.path.join(out_dir, 'crafted_quest_items.png'), 'PNG')
    craft_slices = slice_horizontal_segments(im_craft)
    craft_names = [
        'item_herb_soup.png',
        'item_berry_pie.png',
        'item_dew_tonic.png',
        'item_lantern_frame.png',
        'item_planter_box.png'
    ]
    for idx, name in enumerate(craft_names):
        if idx < len(craft_slices):
            craft_slices[idx].save(os.path.join(out_dir, name), 'PNG')
    print(f"  Saved {len(craft_names)} crafted items")

    # 4. UI HUD icons (1448x1086/13.png)
    im_hud = Image.open(os.path.join(SRC_1448, '13.png')).convert('RGBA')
    autocrop(im_hud).save(os.path.join(out_dir, 'ui_hud_leafcoins.png'), 'PNG')
    hud_slices = slice_horizontal_segments(im_hud)
    hud_names = [
        'ui_leafcoin.png',
        'ui_weather_sunny.png',
        'ui_weather_cloudy.png',
        'ui_weather_rain.png',
        'ui_season_spring.png'
    ]
    for idx, name in enumerate(hud_names):
        if idx < len(hud_slices):
            hud_slices[idx].save(os.path.join(out_dir, name), 'PNG')
    print(f"  Saved {len(hud_names)} UI HUD icons")

if __name__ == '__main__':
    print("=== STARTING ASSET REBUILD ===")
    process_characters()
    process_buildings()
    process_terrain()
    process_nature()
    process_crops()
    process_items()
    print("=== ALL ASSETS REBUILT SUCCESSFULLY ===")
