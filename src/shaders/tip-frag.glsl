#version 300 es

// This is a fragment shader. If you've opened this file first, please
// open and read lambert.vert.glsl before reading on.
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.
uniform vec3 u_Eye;
uniform float u_Pressed;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;
in vec4 fs_Pos;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    // Material base color (before shading)
        vec4 diffuseColor = u_Color;
        vec4 avg = (fs_LightVec + vec4(u_Eye.xyz, 0.f)) / 2.f;
        float specularIntensity;

        if(dot(fs_LightVec, fs_Nor) < 0.f) {
            specularIntensity = 0.5f;
        } else {
            specularIntensity = max(pow(dot(normalize(avg), normalize(fs_Nor)), 9.f), 0.f);
        }
        
        // Calculate the diffuse term for Lambert shading
        float diffuseTerm = dot(normalize(fs_Nor), normalize(fs_LightVec));
        // Avoid negative lighting values
        diffuseTerm = min(diffuseTerm, 1.0);
        diffuseTerm = max(diffuseTerm, 0.0);
        // diffuseTerm = clamp(diffuseTerm, 0, 1);

        float ambientTerm = 0.4;

        float lightIntensity = diffuseTerm * 0.6 + ambientTerm;   //Add a small float value to the color multiplier
                                                            //to simulate ambient lighting. This ensures that faces that are not
                                                            //lit by our point light are not completely black.

        // Compute final shaded color

        vec3 color2 = diffuseColor.xyz;

        float in3 = 0.5;

        if(u_Pressed == 0.) {
            in3 = 0.5;
        } else {
            in3 = 1.0;
        }
        out_Col = vec4(color2 * lightIntensity, 1);
}

