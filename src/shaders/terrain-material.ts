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
      
      //vec4 sand_color = vec4(0.7, 0.6, 0.28, 1.0);
      vec4 sand_color = vec4(0.06, 0.4, 0.10, 1.0);
      float grass_biomes = clamp(pow(fbm(v_Position.xz * 0.03, 2) + 0.3, 5.0), 0.0, 1.0);
      
      vec4 grass_color = mix(vec4(0.30, 0.83, 0.10, 1.0), vec4(0.48, 0.57, 0.69, 1.0),
        clamp(map(v_Position.y, -0.0, 2.0, 0.0, 1.0), 0.0, 1.0)
      );
      
      grass_color = mix(grass_color, sand_color, grass_biomes);
      
      vec4 snow_grass = mix(vec4(0.95, 0.95, 0.95, 1.0), grass_color, map_grass);
      
      vec4 texture_rock = mix(vec4(0.14, 0.2, 0.25, 1.0), vec4(0.22, 0.24, 0.3, 1.0), pow(fbm(v_Position.xz * 3.0, 3), 0.5));
      
      vec4 terrain_texture = mix(snow_grass, texture_rock, map_rock);
      return terrain_texture;
    }
    `);
  }


}
