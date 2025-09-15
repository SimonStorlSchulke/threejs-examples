import { ModifiedStandardMaterial } from 'src/shaders/modifier-standard-material.ts';


export class TerrainMaterial extends ModifiedStandardMaterial {

  constructor() {
    super(`
    vec4 diffuseFn() {
      float noise = fbm(v_Position.xz * 3.0, 5);
    
      vec2 p_dist_grass = distortCoords(v_Position.xy, 1.1, noise);
      float map_grass = clamp(map(p_dist_grass.y, 1.0, 0.8, 0.0, 1.0), 0.0, 1.0);
      
      vec2 p_dist_rock = distortCoords(v_Normal.xy, 0.5, noise);
      float map_rock = clamp(pow(map(p_dist_rock.y, 0.56, 0.67, 1.0, 0.0), 1.0), 0.0, 1.0);
      
      vec4 ground_color_low = mix(
        vec4(0.7, 0.42, 0.19, 1.0),
        vec4(0.30, 0.83, 0.10, 1.0),
        v_Biome.x); 

      vec4 ground_color_high = mix(
        vec4(0.4, 0.2, 0.4, 1.0),
        vec4(0.48, 0.57, 0.69, 1.0),
        v_Biome.x); 

      vec4 ground_variation_color = mix(
        vec4(0.4, 0.26, 0.10, 1.0),
        vec4(0.06, 0.4, 0.10, 1.0),
        v_Biome.x);

      vec4 sand_color = mix(
        vec4(0.6, 0.32, 0.14, 1.0),
        vec4(0.95, 0.95, 0.95, 1.0),
        v_Biome.x);
      
      vec4 rock_color = mix(
        vec4(0.2959, 0.1592, 0.0540, 1.0),
        vec4(0.45, 0.45, 0.55, 1.0),
        v_Biome.x);
        
      
      vec4 water_color = vec4(0.0191, 0.0476, 0.2057, 1.0);

      float ground_variation = clamp(pow(fbm(v_Position.xz * 0.03, 2) + 0.3, 5.0), 0.0, 1.0);
      
      vec4 ground_color = mix(ground_color_low, ground_color_high,
        clamp(map(v_Position.y, -0.0, 2.0, 0.0, 1.0), 0.0, 1.0)
      );
      
      ground_color = mix(ground_color, ground_variation_color, ground_variation);
      
      vec4 snow_grass = mix(sand_color, ground_color, map_grass);
      
      vec4 texture_rock_default = mix(rock_color, vec4(0.22, 0.24, 0.3, 1.0), pow(fbm(v_Position.xz * 3.0, 3), 0.5) * 0.4);
      
      vec4 terrain_texture = mix(snow_grass, texture_rock_default, map_rock);
      float rivers = clamp( pow(v_Biome.y * 2.0, 3.0), 0.0, 1.0) * 0.9;
      return mix(terrain_texture, water_color, rivers);
    }
    `);
  }
}
