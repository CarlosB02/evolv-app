import zlib
import struct
import math
import os

def write_png(filename, width, height, rgba_data):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        raw_data.extend(rgba_data[y * width * 4 : (y + 1) * width * 4])

    compressed = zlib.compress(bytes(raw_data), level=9)
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)  # 8-bit RGBA
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', compressed) + chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename}")

def generate_sun():
    W, H = 256, 256
    pixels = bytearray(W * H * 4)
    cx, cy = 128.0, 128.0
    r_core = 74.0

    # Precalculate ray circles
    num_rays = 16
    rays = []
    for i in range(num_rays):
        angle = (2.0 * math.pi * i) / num_rays
        # Ray center at radius 96, tip at ~118
        rcx = cx + math.cos(angle) * 94.0
        rcy = cy + math.sin(angle) * 94.0
        # Alternating slightly for depth
        ray_r = 20.0 if i % 2 == 0 else 18.0
        rays.append((rcx, rcy, ray_r, angle))

    for y in range(H):
        for x in range(W):
            dx = x - cx
            dy = y - cy
            dist_core = math.hypot(dx, dy)

            # Find distance to sun shape (core disc + rays)
            # Core SDF
            d_core = dist_core - r_core

            # Min dist to any ray
            min_ray_d = 999.0
            closest_ray_idx = -1
            for idx, (rcx, rcy, rr, _) in enumerate(rays):
                rd = math.hypot(x - rcx, y - rcy) - rr
                if rd < min_ray_d:
                    min_ray_d = rd
                    closest_ray_idx = idx

            # Smooth union between core and rays
            k = 18.0
            h = max(0.0, min(1.0, 0.5 + 0.5 * (d_core - min_ray_d) / k))
            dist_field = d_core * h + min_ray_d * (1.0 - h) - k * h * (1.0 - h)

            if dist_field > 1.5:
                continue

            alpha = min(1.0, max(0.0, (1.5 - dist_field) / 2.5))

            # 3D Normal estimation
            # Finite differences for normal
            eps = 1.0
            # d_core at x+eps
            d_right = (math.hypot(dx + eps, dy) - r_core)
            d_left = (math.hypot(dx - eps, dy) - r_core)
            d_down = (math.hypot(dx, dy + eps) - r_core)
            d_up = (math.hypot(dx, dy - eps) - r_core)

            nx = (d_right - d_left) / (2.0 * eps)
            ny = (d_down - d_up) / (2.0 * eps)
            n_len = math.hypot(nx, ny)
            if n_len > 0:
                nx /= n_len
                ny /= n_len

            # 3D spherical dome effect
            dome = max(0.0, 1.0 - (dist_core / 115.0)**2)
            nz = math.sqrt(dome)

            # Key light from top-left (-0.4, -0.5, 0.77)
            lx, ly, lz = -0.4, -0.5, 0.77
            diff = max(0.0, nx * lx + ny * ly + nz * lz)
            
            # Specular highlight
            rx = 2.0 * diff * nx - lx
            ry = 2.0 * diff * ny - ly
            rz = 2.0 * diff * nz - lz
            spec = max(0.0, rz)**24.0

            # Color ramp:
            # Highlight: #FFFBEB (warm ivory)
            # Body: #FBBF24 (amber sun)
            # Warm gradient: #F59E0B to #D97706
            core_factor = max(0.0, 1.0 - dist_core / r_core)
            
            # Soft clay 3D sun
            base_r = 255.0
            base_g = 180.0 + 45.0 * core_factor + 30.0 * diff
            base_b = 30.0 + 80.0 * core_factor + 40.0 * diff

            # Specular adds bright white gleam
            base_r = min(255.0, base_r + spec * 180.0)
            base_g = min(255.0, base_g + spec * 160.0)
            base_b = min(255.0, base_b + spec * 120.0)

            # Ambient occlusion / depth between rays
            if dist_core > r_core - 8.0:
                # darken edges slightly for roundness
                edge_shadow = min(1.0, (dist_core - (r_core - 8.0)) / 30.0)
                base_g -= edge_shadow * 25.0
                base_b -= edge_shadow * 20.0

            pixel_idx = (y * W + x) * 4
            pixels[pixel_idx] = int(min(255, max(0, base_r)))
            pixels[pixel_idx + 1] = int(min(255, max(0, base_g)))
            pixels[pixel_idx + 2] = int(min(255, max(0, base_b)))
            pixels[pixel_idx + 3] = int(alpha * 255)

    return W, H, pixels

def generate_moon():
    W, H = 256, 256
    pixels = bytearray(W * H * 4)
    
    # Outer circle for crescent
    # Moon oriented in a graceful arc like the user's uploaded moon.png
    cx1, cy1, r1 = 138.0, 128.0, 102.0
    # Inner subtracting circle
    cx2, cy2, r2 = 176.0, 116.0, 92.0

    for y in range(H):
        for x in range(W):
            d1 = math.hypot(x - cx1, y - cy1) - r1
            d2 = math.hypot(x - cx2, y - cy2) - r2

            # Crescent SDF = max(d1, -d2)
            crescent_dist = max(d1, -d2)

            if crescent_dist > 1.5:
                continue

            alpha = min(1.0, max(0.0, (1.5 - crescent_dist) / 2.5))

            # Inner edge distance (how close to the inner curve)
            inner_proximity = max(0.0, 1.0 - abs(d2) / 28.0)

            # Procedural rocky texture (subtle craters / roughness)
            # High-frequency noise simulation
            s1 = math.sin(x * 0.15) * math.cos(y * 0.15)
            s2 = math.sin(x * 0.35 + 1.2) * math.sin(y * 0.35 + 0.8)
            crater_noise = (s1 * 0.6 + s2 * 0.4)

            # Normal from outer circle
            nx = (x - cx1) / r1
            ny = (y - cy1) / r1
            nz = math.sqrt(max(0.0, 1.0 - nx*nx - ny*ny))

            # Lighting
            # Dark charcoal rock base
            rock_base = 32.0 + 20.0 * nz + crater_noise * 12.0
            r_val = rock_base
            g_val = rock_base * 0.95
            b_val = rock_base * 0.92

            # Volcanic / ember orange rim lighting along the inner crescent edge
            # (Matches user's exact uploaded image where the inside of the crescent glows with warm ember/orange lava)
            if d2 < 0.0 and abs(d2) < 32.0:
                glow_intensity = (1.0 - abs(d2) / 32.0) ** 1.4
                # Subtle texture inside glow
                glow_mod = 0.8 + 0.3 * (math.sin(x * 0.2 + y * 0.1) * 0.5 + 0.5)
                ember_factor = glow_intensity * glow_mod

                # Fiery orange / copper glow
                r_val += 220.0 * ember_factor
                g_val += 105.0 * ember_factor
                b_val += 20.0 * ember_factor

            # Subtle outer rim light (cool faint silver)
            if abs(d1) < 14.0 and x < cx1:
                outer_rim = (1.0 - abs(d1) / 14.0) * 0.4
                r_val += 60.0 * outer_rim
                g_val += 65.0 * outer_rim
                b_val += 75.0 * outer_rim

            pixel_idx = (y * W + x) * 4
            pixels[pixel_idx] = int(min(255, max(0, r_val)))
            pixels[pixel_idx + 1] = int(min(255, max(0, g_val)))
            pixels[pixel_idx + 2] = int(min(255, max(0, b_val)))
            pixels[pixel_idx + 3] = int(alpha * 255)

    return W, H, pixels

if __name__ == '__main__':
    # Write to public/ and public/assets/
    w_sun, h_sun, sun_data = generate_sun()
    write_png('public/sun.png', w_sun, h_sun, sun_data)
    write_png('public/assets/sun.png', w_sun, h_sun, sun_data)

    w_moon, h_moon, moon_data = generate_moon()
    write_png('public/moon.png', w_moon, h_moon, moon_data)
    write_png('public/assets/moon.png', w_moon, h_moon, moon_data)
    print("All theme icons generated successfully!")
