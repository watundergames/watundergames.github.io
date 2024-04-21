var vertexShader$l = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$l = "precision mediump float;\nuniform sampler2D u_image;\nuniform float scaleX;\nuniform float scaleY;\nvarying vec2 v_texCoord;\nvarying float v_progress;\nvoid main(){\n    vec2 pos = vec2(v_texCoord[0]*1.0/scaleX - (1.0/scaleX/2.0 -0.5), v_texCoord[1]*1.0/scaleY - (1.0/scaleY/2.0 -0.5));\n    vec4 color = texture2D(u_image, pos);\n    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\n        color = vec4(0.0,0.0,0.0,0.0);\n    }\n    gl_FragColor = color;\n}\n";

let aaf_video_scale = {
    title: "AAF Video Scale Effect",
    description: "A scale effect based on the AAF spec.",
    vertexShader: vertexShader$l,
    fragmentShader: fragmentShader$l,
    properties: {
        scaleX: { type: "uniform", value: 1.0 },
        scaleY: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$k = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$k = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    color_a[0] *= (1.0 - mix);\n    color_a[1] *= (1.0 - mix);\n    color_a[2] *= (1.0 - mix);\n    color_a[3] *= (1.0 - mix);\n    color_b[0] *= mix;\n    color_b[1] *= mix;\n    color_b[2] *= mix;\n    color_b[3] *= mix;\n    gl_FragColor = color_a + color_b;\n}\n";

let crossfade = {
    title: "Cross-Fade",
    description: "A cross-fade effect. Typically used as a transistion.",
    vertexShader: vertexShader$k,
    fragmentShader: fragmentShader$k,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$j = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$j = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    if (v_texCoord[0] > mix){\n        gl_FragColor = color_a;\n    } else {\n        gl_FragColor = color_b;\n    }\n}\n";

let horizontal_wipe = {
    title: "Horizontal Wipe",
    description: "A horizontal wipe effect. Typically used as a transistion.",
    vertexShader: vertexShader$j,
    fragmentShader: fragmentShader$j,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$i = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$i = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    if (v_texCoord[1] > mix){\n        gl_FragColor = color_a;\n    } else {\n        gl_FragColor = color_b;\n    }\n}\n";

let verticalWipe = {
    title: "vertical Wipe",
    description: "A vertical wipe effect. Typically used as a transistion.",
    vertexShader: vertexShader$i,
    fragmentShader: fragmentShader$i,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$h = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$h = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nfloat rand(vec2 co){\n    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    if (clamp(rand(v_texCoord),  0.01, 1.001) > mix){\n        gl_FragColor = color_a;\n    } else {\n        gl_FragColor = color_b;\n    }\n}\n";

let randomDissolve = {
    title: "Random Dissolve",
    description: "A random dissolve effect. Typically used as a transistion.",
    vertexShader: vertexShader$h,
    fragmentShader: fragmentShader$h,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$g = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$g = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nuniform vec4 color;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    float mix_amount = (mix *2.0) - 1.0;\n    if(mix_amount < 0.0){\n        gl_FragColor = abs(mix_amount) * color_a + (1.0 - abs(mix_amount)) * color;\n    } else {\n        gl_FragColor = mix_amount * color_b + (1.0 - mix_amount) * color;\n    }\n}\n";

let toColorAndBackFade = {
    title: "To Color And Back Fade",
    description:
        "A fade to black and back effect. Setting mix to 0.5 is a fully solid color frame. Typically used as a transistion.",
    vertexShader: vertexShader$g,
    fragmentShader: fragmentShader$g,
    properties: {
        mix: { type: "uniform", value: 0.0 },
        color: { type: "uniform", value: [0.0, 0.0, 0.0, 0.0] }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$f = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$f = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nfloat sign (vec2 p1, vec2 p2, vec2 p3){\n    return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);\n}\nbool pointInTriangle(vec2 pt, vec2 v1, vec2 v2, vec2 v3){\n    bool b1, b2, b3;\n    b1 = sign(pt, v1, v2) < 0.0;\n    b2 = sign(pt, v2, v3) < 0.0;\n    b3 = sign(pt, v3, v1) < 0.0;\n    return ((b1 == b2) && (b2 == b3));\n}\nvec2 rotatePointAboutPoint(vec2 point, vec2 pivot, float angle){\n    float s = sin(angle);\n    float c = cos(angle);\n    float x = point[0] - pivot[0];\n    float y = point[1] - pivot[1];\n    float new_x = x * c - y * s;\n    float new_y = x * s + y * c;\n    return vec2(new_x + pivot[0], new_y+pivot[1]);\n}\n\nvoid main(){\n    vec4 color_a = texture2D(u_image_b, v_texCoord);\n    vec4 color_b = texture2D(u_image_a, v_texCoord);\n    vec2 t0_p0,t0_p1,t0_p2,t1_p0,t1_p1,t1_p2,t2_p0,t2_p1,t2_p2,t3_p0,t3_p1,t3_p2;\n    vec2 t4_p0,t4_p1,t4_p2,t5_p0,t5_p1,t5_p2,t6_p0,t6_p1,t6_p2,t7_p0,t7_p1,t7_p2;\n\n\n    t0_p0 = vec2(0.0, 0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\n    t0_p1 = vec2(0.0, -0.25) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\n    t0_p2 = vec2(1.0, 0.0) * clamp(mix,0.0,1.0) * 2.0 + vec2(0.5,0.5);\n\n    t1_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854);\n    t1_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854);\n    t1_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854);\n\n    t2_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 2.0);\n    t2_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 2.0);\n    t2_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 2.0);\n\n    t3_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 3.0);\n    t3_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 3.0);\n    t3_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 3.0);\n\n    t4_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 4.0);\n    t4_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 4.0);\n    t4_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 4.0);\n\n    t5_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 5.0);\n    t5_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 5.0);\n    t5_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 5.0);\n\n    t6_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 6.0);\n    t6_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 6.0);\n    t6_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 6.0);\n\n    t7_p0 = rotatePointAboutPoint(t0_p0, vec2(0.5,0.5), 0.7854 * 7.0);\n    t7_p1 = rotatePointAboutPoint(t0_p1, vec2(0.5,0.5), 0.7854 * 7.0);\n    t7_p2 = rotatePointAboutPoint(t0_p2, vec2(0.5,0.5), 0.7854 * 7.0);\n\n    if(mix > 0.99){\n        gl_FragColor = color_a;\n        return;\n    }\n    if(mix < 0.01){\n        gl_FragColor = color_b;\n        return;\n    }\n    if(pointInTriangle(v_texCoord, t0_p0, t0_p1, t0_p2) || pointInTriangle(v_texCoord, t1_p0, t1_p1, t1_p2) || pointInTriangle(v_texCoord, t2_p0, t2_p1, t2_p2) || pointInTriangle(v_texCoord, t3_p0, t3_p1, t3_p2) || pointInTriangle(v_texCoord, t4_p0, t4_p1, t4_p2) || pointInTriangle(v_texCoord, t5_p0, t5_p1, t5_p2) || pointInTriangle(v_texCoord, t6_p0, t6_p1, t6_p2) || pointInTriangle(v_texCoord, t7_p0, t7_p1, t7_p2)){\n        gl_FragColor = color_a;\n    } else {\n        gl_FragColor = color_b;\n    }\n}\n";

let starWipe = {
    title: "Star Wipe Fade",
    description: "A classic star wipe transistion. Typically used as a transistion.",
    vertexShader: vertexShader$f,
    fragmentShader: fragmentShader$f,
    properties: {
        mix: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$e = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$e = "precision mediump float;\nuniform sampler2D u_image;\nuniform float a;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    gl_FragColor = color;\n}\n";

let combine = {
    title: "Combine",
    description:
        "A basic effect which renders the input to the output, Typically used as a combine node for layering up media with alpha transparency.",
    vertexShader: vertexShader$e,
    fragmentShader: fragmentShader$e,
    properties: {
        a: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$d = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$d = "precision mediump float;\nuniform sampler2D u_image;\nuniform float a;\nuniform vec3 colorAlphaThreshold;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    if (color[0] > colorAlphaThreshold[0] && color[1]> colorAlphaThreshold[1] && color[2]> colorAlphaThreshold[2]){\n        color = vec4(0.0,0.0,0.0,0.0);\n    }\n    gl_FragColor = color;\n}\n";

let colorThreshold = {
    title: "Color Threshold",
    description: "Turns all pixels with a greater value than the specified threshold transparent.",
    vertexShader: vertexShader$d,
    fragmentShader: fragmentShader$d,
    properties: {
        a: { type: "uniform", value: 0.0 },
        colorAlphaThreshold: { type: "uniform", value: [0.0, 0.55, 0.0] }
    },
    inputs: ["u_image"]
};

var vertexShader$c = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$c = "precision mediump float;\nuniform sampler2D u_image;\nuniform vec3 inputMix;\nuniform vec3 outputMix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    float mono = color[0]*inputMix[0] + color[1]*inputMix[1] + color[2]*inputMix[2];\n    color[0] = mono * outputMix[0];\n    color[1] = mono * outputMix[1];\n    color[2] = mono * outputMix[2];\n    gl_FragColor = color;\n}\n";

let monochrome = {
    title: "Monochrome",
    description:
        "Change images to a single chroma (e.g can be used to make a black & white filter). Input color mix and output color mix can be adjusted.",
    vertexShader: vertexShader$c,
    fragmentShader: fragmentShader$c,
    properties: {
        inputMix: { type: "uniform", value: [0.4, 0.6, 0.2] },
        outputMix: { type: "uniform", value: [1.0, 1.0, 1.0] }
    },
    inputs: ["u_image"]
};

var vertexShader$b = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nuniform float blurAmount;\nvarying vec2 v_texCoord;\nvarying vec2 v_blurTexCoords[14];\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n    v_blurTexCoords[ 0] = v_texCoord + vec2(-0.028 * blurAmount, 0.0);\n    v_blurTexCoords[ 1] = v_texCoord + vec2(-0.024 * blurAmount, 0.0);\n    v_blurTexCoords[ 2] = v_texCoord + vec2(-0.020 * blurAmount, 0.0);\n    v_blurTexCoords[ 3] = v_texCoord + vec2(-0.016 * blurAmount, 0.0);\n    v_blurTexCoords[ 4] = v_texCoord + vec2(-0.012 * blurAmount, 0.0);\n    v_blurTexCoords[ 5] = v_texCoord + vec2(-0.008 * blurAmount, 0.0);\n    v_blurTexCoords[ 6] = v_texCoord + vec2(-0.004 * blurAmount, 0.0);\n    v_blurTexCoords[ 7] = v_texCoord + vec2( 0.004 * blurAmount, 0.0);\n    v_blurTexCoords[ 8] = v_texCoord + vec2( 0.008 * blurAmount, 0.0);\n    v_blurTexCoords[ 9] = v_texCoord + vec2( 0.012 * blurAmount, 0.0);\n    v_blurTexCoords[10] = v_texCoord + vec2( 0.016 * blurAmount, 0.0);\n    v_blurTexCoords[11] = v_texCoord + vec2( 0.020 * blurAmount, 0.0);\n    v_blurTexCoords[12] = v_texCoord + vec2( 0.024 * blurAmount, 0.0);\n    v_blurTexCoords[13] = v_texCoord + vec2( 0.028 * blurAmount, 0.0);\n}\n";

var fragmentShader$b = "precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvarying vec2 v_blurTexCoords[14];\nvoid main(){\n    gl_FragColor = vec4(0.0);\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\n    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\n}\n";

let horizontal_blur = {
    title: "Horizontal Blur",
    description:
        "A horizontal blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
    vertexShader: vertexShader$b,
    fragmentShader: fragmentShader$b,
    properties: {
        blurAmount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$a = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nuniform float blurAmount;\nvarying vec2 v_blurTexCoords[14];\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n    v_blurTexCoords[ 0] = v_texCoord + vec2(0.0,-0.028 * blurAmount);\n    v_blurTexCoords[ 1] = v_texCoord + vec2(0.0,-0.024 * blurAmount);\n    v_blurTexCoords[ 2] = v_texCoord + vec2(0.0,-0.020 * blurAmount);\n    v_blurTexCoords[ 3] = v_texCoord + vec2(0.0,-0.016 * blurAmount);\n    v_blurTexCoords[ 4] = v_texCoord + vec2(0.0,-0.012 * blurAmount);\n    v_blurTexCoords[ 5] = v_texCoord + vec2(0.0,-0.008 * blurAmount);\n    v_blurTexCoords[ 6] = v_texCoord + vec2(0.0,-0.004 * blurAmount);\n    v_blurTexCoords[ 7] = v_texCoord + vec2(0.0, 0.004 * blurAmount);\n    v_blurTexCoords[ 8] = v_texCoord + vec2(0.0, 0.008 * blurAmount);\n    v_blurTexCoords[ 9] = v_texCoord + vec2(0.0, 0.012 * blurAmount);\n    v_blurTexCoords[10] = v_texCoord + vec2(0.0, 0.016 * blurAmount);\n    v_blurTexCoords[11] = v_texCoord + vec2(0.0, 0.020 * blurAmount);\n    v_blurTexCoords[12] = v_texCoord + vec2(0.0, 0.024 * blurAmount);\n    v_blurTexCoords[13] = v_texCoord + vec2(0.0, 0.028 * blurAmount);\n}\n";

var fragmentShader$a = "precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvarying vec2 v_blurTexCoords[14];\nvoid main(){\n    gl_FragColor = vec4(0.0);\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 0])*0.0044299121055113265;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 1])*0.00895781211794;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 2])*0.0215963866053;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 3])*0.0443683338718;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 4])*0.0776744219933;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 5])*0.115876621105;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 6])*0.147308056121;\n    gl_FragColor += texture2D(u_image, v_texCoord         )*0.159576912161;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 7])*0.147308056121;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 8])*0.115876621105;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[ 9])*0.0776744219933;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[10])*0.0443683338718;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[11])*0.0215963866053;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[12])*0.00895781211794;\n    gl_FragColor += texture2D(u_image, v_blurTexCoords[13])*0.0044299121055113265;\n}\n";

let verticalBlur = {
    title: "Vertical Blur",
    description:
        "A vertical blur effect. Adpated from http://xissburg.com/faster-gaussian-blur-in-glsl/",
    vertexShader: vertexShader$a,
    fragmentShader: fragmentShader$a,
    properties: {
        blurAmount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$9 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$9 = "precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvoid main(){\n    vec2 coord = vec2(1.0 - v_texCoord[0] ,v_texCoord[1]);\n    vec4 color = texture2D(u_image, coord);\n    gl_FragColor = color;\n}\n";

let aaf_video_flop = {
    title: "AAF Video Flop Effect",
    description: "A flop effect based on the AAF spec. Mirrors the image in the y-axis",
    vertexShader: vertexShader$9,
    fragmentShader: fragmentShader$9,
    properties: {},
    inputs: ["u_image"]
};

var vertexShader$8 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$8 = "precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvoid main(){\n    vec2 coord = vec2(v_texCoord[0] ,1.0 - v_texCoord[1]);\n    vec4 color = texture2D(u_image, coord);\n    gl_FragColor = color;\n}\n";

let aaf_video_flip = {
    title: "AAF Video Flip Effect",
    description: "A flip effect based on the AAF spec. Mirrors the image in the x-axis",
    vertexShader: vertexShader$8,
    fragmentShader: fragmentShader$8,
    properties: {},
    inputs: ["u_image"]
};

var vertexShader$7 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$7 = "precision mediump float;\nuniform sampler2D u_image;\nuniform float positionOffsetX;\nuniform float positionOffsetY;\nvarying vec2 v_texCoord;\nvarying float v_progress;\nvoid main(){\n    vec2 pos = vec2(v_texCoord[0] - positionOffsetX/2.0, v_texCoord[1] -  positionOffsetY/2.0);\n    vec4 color = texture2D(u_image, pos);\n    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\n        color = vec4(0.0,0.0,0.0,0.0);\n    }\n    gl_FragColor = color;\n}\n";

let aaf_video_position = {
    title: "AAF Video Position Effect",
    description: "A position effect based on the AAF spec.",
    vertexShader: vertexShader$7,
    fragmentShader: fragmentShader$7,
    properties: {
        positionOffsetX: { type: "uniform", value: 0.0 },
        positionOffsetY: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$6 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$6 = "precision mediump float;\nuniform sampler2D u_image;\nuniform float cropLeft;\nuniform float cropRight;\nuniform float cropTop;\nuniform float cropBottom;\nvarying vec2 v_texCoord;\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    if (v_texCoord[0] < (cropLeft+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\n    if (v_texCoord[0] > (cropRight+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\n    if (v_texCoord[1] < (-cropBottom+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\n    if (v_texCoord[1] > (-cropTop+1.0)/2.0) color = vec4(0.0,0.0,0.0,0.0);\n    gl_FragColor = color;\n}\n";

let aaf_video_crop = {
    title: "AAF Video Crop Effect",
    description: "A crop effect based on the AAF spec.",
    vertexShader: vertexShader$6,
    fragmentShader: fragmentShader$6,
    properties: {
        cropLeft: { type: "uniform", value: -1.0 },
        cropRight: { type: "uniform", value: 1.0 },
        cropTop: { type: "uniform", value: -1.0 },
        cropBottom: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$5 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$5 = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nuniform float currentTime;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nfloat rand(vec2 co, float currentTime){\n    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);\n}\nvoid main(){\n    vec4 color_a = texture2D(u_image_a, v_texCoord);\n    vec4 color_b = texture2D(u_image_b, v_texCoord);\n    if (clamp(rand(v_texCoord, currentTime),  0.01, 1.001) > mix){\n        gl_FragColor = color_a;\n    } else {\n        gl_FragColor = color_b;\n    }\n}\n";

let staticDissolve = {
    title: "Static Dissolve",
    description: "A static dissolve effect. Typically used as a transistion.",
    vertexShader: vertexShader$5,
    fragmentShader: fragmentShader$5,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$4 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$4 = "precision mediump float;\nuniform sampler2D u_image;\nuniform float currentTime;\nuniform float amount;\nvarying vec2 v_texCoord;\nuniform vec3 weight;\nfloat rand(vec2 co, float currentTime){\n    return fract(sin(dot(co.xy,vec2(12.9898,78.233))+currentTime) * 43758.5453);\n}\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    color[0] = color[0] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[0] * amount;\n    color[1] = color[1] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[1] * amount;\n    color[2] = color[2] + (2.0*(clamp(rand(v_texCoord, currentTime),  0.01, 1.001)-0.5)) * weight[2] *amount;\n    gl_FragColor = color;\n}\n";

let staticEffect = {
    title: "Static",
    description: "A static effect to add pseudo random noise to a video",
    vertexShader: vertexShader$4,
    fragmentShader: fragmentShader$4,
    properties: {
        weight: { type: "uniform", value: [1.0, 1.0, 1.0] },
        amount: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

var vertexShader$3 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$3 = "precision mediump float;\nuniform sampler2D u_image_a;\nuniform sampler2D u_image_b;\nuniform float mix;\nvarying vec2 v_texCoord;\nvarying float v_mix;\nvoid main(){\n    float wobble = 1.0 - abs((mix*2.0)-1.0);\n    vec2 pos = vec2(v_texCoord[0] + ((sin(v_texCoord[1]*(10.0*wobble*3.14) + wobble*10.0)/13.0)), v_texCoord[1]);\n    vec4 color_a = texture2D(u_image_a, pos);\n    vec4 color_b = texture2D(u_image_b, pos);\n    color_a[0] *= (1.0 - mix);\n    color_a[1] *= (1.0 - mix);\n    color_a[2] *= (1.0 - mix);\n    color_a[3] *= (1.0 - mix);\n    color_b[0] *= mix;\n    color_b[1] *= mix;\n    color_b[2] *= mix;\n    color_b[3] *= mix;\n    gl_FragColor = color_a + color_b;\n}\n";

let dreamfade = {
    title: "Dream-Fade",
    description: "A wobbly dream effect. Typically used as a transistion.",
    vertexShader: vertexShader$3,
    fragmentShader: fragmentShader$3,
    properties: {
        mix: { type: "uniform", value: 0.0 }
    },
    inputs: ["u_image_a", "u_image_b"]
};

var vertexShader$2 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$2 = "precision mediump float;\nuniform sampler2D u_image;\nuniform float opacity;\nvarying vec2 v_texCoord;\nvarying float v_opacity;\nvoid main(){\n    vec4 color = texture2D(u_image, v_texCoord);\n    color[3] *= opacity;\n    gl_FragColor = color;\n}\n";

const opacity = {
    title: "Opacity",
    description: "Sets the opacity of an input.",
    vertexShader: vertexShader$2,
    fragmentShader: fragmentShader$2,
    properties: {
        opacity: { type: "uniform", value: 0.7 }
    },
    inputs: ["u_image"]
};

var vertexShader$1 = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

var fragmentShader$1 = "precision mediump float;\nuniform sampler2D u_image;\nuniform float x;\nuniform float y;\nuniform float width;\nuniform float height;\nvarying vec2 v_texCoord;\nvarying float v_progress;\nvoid main(){\n    vec2 pos = (((v_texCoord)*vec2(width, height)) + vec2(0, 1.0-height)) +vec2(x,-y);\n    vec4 color = texture2D(u_image, pos);\n    if (pos[0] < 0.0 || pos[0] > 1.0 || pos[1] < 0.0 || pos[1] > 1.0){\n        color = vec4(0.0,0.0,0.0,0.0);\n    }\n    gl_FragColor = color;\n}\n";

let crop = {
    title: "Primer Simple Crop",
    description: "A simple crop processors for primer",
    vertexShader: vertexShader$1,
    fragmentShader: fragmentShader$1,
    properties: {
        x: { type: "uniform", value: 0.0 },
        y: { type: "uniform", value: 0.0 },
        width: { type: "uniform", value: 1.0 },
        height: { type: "uniform", value: 1.0 }
    },
    inputs: ["u_image"]
};

let DEFINITIONS = {
    AAF_VIDEO_SCALE: aaf_video_scale,
    CROSSFADE: crossfade,
    DREAMFADE: dreamfade,
    HORIZONTAL_WIPE: horizontal_wipe,
    VERTICAL_WIPE: verticalWipe,
    RANDOM_DISSOLVE: randomDissolve,
    STATIC_DISSOLVE: staticDissolve,
    STATIC_EFFECT: staticEffect,
    TO_COLOR_AND_BACK: toColorAndBackFade,
    STAR_WIPE: starWipe,
    COMBINE: combine,
    COLORTHRESHOLD: colorThreshold,
    MONOCHROME: monochrome,
    HORIZONTAL_BLUR: horizontal_blur,
    VERTICAL_BLUR: verticalBlur,
    AAF_VIDEO_CROP: aaf_video_crop,
    AAF_VIDEO_POSITION: aaf_video_position,
    AAF_VIDEO_FLIP: aaf_video_flip,
    AAF_VIDEO_FLOP: aaf_video_flop,
    OPACITY: opacity,
    CROP: crop
};

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$a = "GraphNode";

class GraphNode {
    /**
     * Base class from which all processing and source nodes are derrived.
     */
    constructor(gl, renderGraph, inputNames, limitConnections = false) {
        this._renderGraph = renderGraph;
        this._limitConnections = limitConnections;
        this._inputNames = inputNames;
        this._destroyed = false;

        //Setup WebGL output texture
        this._gl = gl;
        this._renderGraph = renderGraph;
        this._rendered = false;
        this._displayName = TYPE$a;
    }

    /**
     * Get a string representation of the class name.
     *
     * @return String A string of the class name.
     */

    get displayName() {
        return this._displayName;
    }

    /**
     * Get the names of the inputs to this node.
     *
     * @return {String[]} An array of the names of the inputs ot the node.
     */

    get inputNames() {
        return this._inputNames.slice();
    }

    /**
     * The maximum number of connections that can be made to this node. If there is not limit this will return Infinity.
     *
     * @return {number} The number of connections which can be made to this node.
     */
    get maximumConnections() {
        if (this._limitConnections === false) return Infinity;
        return this._inputNames.length;
    }

    /**
     * Get an array of all the nodes which connect to this node.
     *
     * @return {GraphNode[]} An array of nodes which connect to this node.
     */
    get inputs() {
        let result = this._renderGraph.getInputsForNode(this);
        result = result.filter(function(n) {
            return n !== undefined;
        });
        return result;
    }

    /**
     * Get an array of all the nodes which this node outputs to.
     *
     * @return {GraphNode[]} An array of nodes which this node connects to.
     */
    get outputs() {
        return this._renderGraph.getOutputsForNode(this);
    }

    /**
     * Get whether the node has been destroyed or not.
     *
     * @return {boolean} A true/false value of whather the node has been destoryed or not.
     */
    get destroyed() {
        return this._destroyed;
    }

    /**
     * Connect this node to the targetNode
     *
     * @param {GraphNode} targetNode - the node to connect.
     * @param {(number| String)} [targetPort] - the port on the targetNode to connect to, this can be an index, a string identifier, or undefined (in which case the next available port will be connected to).
     *
     */
    connect(targetNode, targetPort) {
        return this._renderGraph.registerConnection(this, targetNode, targetPort);
    }

    /**
     * Disconnect this node from the targetNode. If targetNode is undefind remove all out-bound connections.
     *
     * @param {GraphNode} [targetNode] - the node to disconnect from. If undefined, disconnect from all nodes.
     *
     */
    disconnect(targetNode) {
        if (targetNode === undefined) {
            let toRemove = this._renderGraph.getOutputsForNode(this);
            toRemove.forEach(target => this._renderGraph.unregisterConnection(this, target));
            if (toRemove.length > 0) return true;
            return false;
        }
        return this._renderGraph.unregisterConnection(this, targetNode);
    }

    /**
     * Destory this node, removing it from the graph.
     */
    destroy() {
        this.disconnect();
        for (let input of this.inputs) {
            input.disconnect(this);
        }
        this._destroyed = true;
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

let STATE$1 = {
    waiting: 0,
    sequenced: 1,
    playing: 2,
    paused: 3,
    ended: 4,
    error: 5
};

const TYPE$9 = "SourceNode";

class SourceNode extends GraphNode {
    /**
     * Initialise an instance of a SourceNode.
     * This is the base class for other Nodes which generate media to be passed into the processing pipeline.
     */
    constructor(src, gl, renderGraph, currentTime) {
        super(gl, renderGraph, [], true);
        this._element = undefined;
        this._elementURL = undefined;
        this._isResponsibleForElementLifeCycle = true;

        if (
            typeof src === "string" ||
            (window.MediaStream !== undefined && src instanceof MediaStream)
        ) {
            //create the node from the passed URL or MediaStream
            this._elementURL = src;
        } else {
            //use the passed element to create the SourceNode
            this._element = src;
            this._isResponsibleForElementLifeCycle = false;
        }

        this._state = STATE$1.waiting;
        this._currentTime = currentTime;
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._ready = false;
        this._loadCalled = false;
        this._stretchPaused = false;
        this._texture = createElementTexture(gl);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );
        this._callbacks = [];
        this._renderPaused = false;
        this._displayName = TYPE$9;
    }

    /**
     * Returns the state of the node.
     * 0 - Waiting, start() has not been called on it yet.
     * 1 - Sequenced, start() has been called but it is not playing yet.
     * 2 - Playing, the node is playing.
     * 3 - Paused, the node is paused.
     * 4 - Ended, playback of the node has finished.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * console.log(videoNode.state); //will output 0 (for waiting)
     * videoNode.start(5);
     * console.log(videoNode.state); //will output 1 (for sequenced)
     * videoNode.stop(10);
     * ctx.play();
     * console.log(videoNode.state); //will output 2 (for playing)
     * ctx.paused();
     * console.log(videoNode.state); //will output 3 (for paused)
     */
    get state() {
        return this._state;
    }

    /**
     * Returns the underlying DOM element which represents this source node.
     * Note: If a source node is created with a url rather than passing in an existing element then this will return undefined until the source node preloads the element.
     *
     * @return {Element} The underlying DOM element representing the media for the node. If the lifecycle of the video is owned UNSIGNED_BYTE the node itself, this can return undefined if the element hasn't been loaded yet.
     *
     * @example
     * //Accessing the Element on a VideoNode created via a URL
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * videoNode.start(0);
     * videoNode.stop(5);
     * //When the node starts playing the element should exist so set it's volume to 0
     * videoNode.regsiterCallback("play", function(){videoNode.element.volume = 0;});
     *
     *
     * @example
     * //Accessing the Element on a VideoNode created via an already existing element
     * var ctx = new VideoContext();
     * var videoElement = document.createElement("video");
     * var videoNode = ctx.createVideoSourceNode(videoElement);
     * videoNode.start(0);
     * videoNode.stop(5);
     * //The elemnt can be accessed any time because it's lifecycle is managed outside of the VideoContext
     * videoNode.element.volume = 0;
     *
     */
    get element() {
        return this._element;
    }

    /**
     * Returns the duration of the node on a timeline. If no start time is set will return undefiend, if no stop time is set will return Infinity.
     *
     * @return {number} The duration of the node in seconds.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     * videoNode.start(5);
     * videoNode.stop(10);
     * console.log(videoNode.duration); //will output 10
     */
    get duration() {
        if (isNaN(this._startTime)) return undefined;
        if (this._stopTime === Infinity) return Infinity;
        return this._stopTime - this._startTime;
    }

    set stretchPaused(stretchPaused) {
        this._stretchPaused = stretchPaused;
    }

    get stretchPaused() {
        return this._stretchPaused;
    }

    _load() {
        if (!this._loadCalled) {
            this._triggerCallbacks("load");
            this._loadCalled = true;
        }
    }

    _unload() {
        this._triggerCallbacks("destroy");
        this._loadCalled = false;
    }

    /**
     * Register callbacks against one of these events: "load", "destroy", "seek", "pause", "play", "ended", "durationchange", "loaded", "error"
     *
     * @param {String} type - the type of event to register the callback against.
     * @param {function} func - the function to call.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     *
     */
    registerCallback(type, func) {
        this._callbacks.push({ type: type, func: func });
    }

    /**
     * Remove callback.
     *
     * @param {function} [func] - the callback to remove, if undefined will remove all callbacks for this node.
     *
     * @example
     * var ctx = new VideoContext();
     * var videoNode = ctx.createVideoSourceNode('video.mp4');
     *
     * videoNode.registerCallback("load", function(){"video is loading"});
     * videoNode.registerCallback("play", function(){"video is playing"});
     * videoNode.registerCallback("ended", function(){"video has eneded"});
     * videoNode.unregisterCallback(); //remove all of the three callbacks.
     *
     */
    unregisterCallback(func) {
        let toRemove = [];
        for (let callback of this._callbacks) {
            if (func === undefined) {
                toRemove.push(callback);
            } else if (callback.func === func) {
                toRemove.push(callback);
            }
        }
        for (let callback of toRemove) {
            let index = this._callbacks.indexOf(callback);
            this._callbacks.splice(index, 1);
        }
    }

    _triggerCallbacks(type, data) {
        for (let callback of this._callbacks) {
            if (callback.type === type) {
                if (data !== undefined) {
                    callback.func(this, data);
                } else {
                    callback.func(this);
                }
            }
        }
    }

    /**
     * Start playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
     *
     * @param {number} time - the time from the currentTime of the VideoContext which to start playing, if negative will play as soon as possible.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
     */
    start(time) {
        if (this._state !== STATE$1.waiting) {
            console.debug("SourceNode is has already been sequenced. Can't sequence twice.");
            return false;
        }

        this._startTime = this._currentTime + time;
        this._state = STATE$1.sequenced;
        return true;
    }

    /**
     * Start playback at an absolute time ont the VideoContext's timeline.
     *
     * @param {number} time - the time on the VideoContexts timeline to start playing.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if it is already sequenced.
     */
    startAt(time) {
        if (this._state !== STATE$1.waiting) {
            console.debug("SourceNode is has already been sequenced. Can't sequence twice.");
            return false;
        }
        this._startTime = time;
        this._state = STATE$1.sequenced;
        return true;
    }

    get startTime() {
        return this._startTime;
    }

    /**
     * Stop playback at VideoContext.currentTime plus passed time. If passed time is negative, will play as soon as possible.
     *
     * @param {number} time - the time from the currentTime of the video context which to stop playback.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
     */
    stop(time) {
        if (this._state === STATE$1.ended) {
            console.debug("SourceNode has already ended. Cannot call stop.");
            return false;
        } else if (this._state === STATE$1.waiting) {
            console.debug("SourceNode must have start called before stop is called");
            return false;
        }
        if (this._currentTime + time <= this._startTime) {
            console.debug("SourceNode must have a stop time after it's start time, not before.");
            return false;
        }
        this._stopTime = this._currentTime + time;
        this._stretchPaused = false;
        this._triggerCallbacks("durationchange", this.duration);
        return true;
    }

    /**
     * Stop playback at an absolute time ont the VideoContext's timeline.
     *
     * @param {number} time - the time on the VideoContexts timeline to stop playing.
     * @return {boolean} Will return true is seqeuncing has succeded, or false if the playback has already ended or if start hasn't been called yet, or if time is less than the start time.
     */
    stopAt(time) {
        if (this._state === STATE$1.ended) {
            console.debug("SourceNode has already ended. Cannot call stop.");
            return false;
        } else if (this._state === STATE$1.waiting) {
            console.debug("SourceNode must have start called before stop is called");
            return false;
        }
        if (time <= this._startTime) {
            console.debug("SourceNode must have a stop time after it's start time, not before.");
            return false;
        }
        this._stopTime = time;
        this._stretchPaused = false;
        this._triggerCallbacks("durationchange", this.duration);
        return true;
    }

    get stopTime() {
        return this._stopTime;
    }

    _seek(time) {
        this._renderPaused = false;

        this._triggerCallbacks("seek", time);

        if (this._state === STATE$1.waiting) return;
        if (time < this._startTime) {
            clearTexture(this._gl, this._texture);
            this._state = STATE$1.sequenced;
        }
        if (time >= this._startTime && this._state !== STATE$1.paused) {
            this._state = STATE$1.playing;
        }
        if (time >= this._stopTime) {
            clearTexture(this._gl, this._texture);
            this._triggerCallbacks("ended");
            this._state = STATE$1.ended;
        }
        //update the current time
        this._currentTime = time;
    }

    _pause() {
        if (this._state === STATE$1.playing || (this._currentTime === 0 && this._startTime === 0)) {
            this._triggerCallbacks("pause");
            this._state = STATE$1.paused;
            this._renderPaused = false;
        }
    }
    _play() {
        if (this._state === STATE$1.paused) {
            this._triggerCallbacks("play");
            this._state = STATE$1.playing;
        }
    }

    _isReady() {
        if (this._buffering) {
            return false;
        }
        if (
            this._state === STATE$1.playing ||
            this._state === STATE$1.paused ||
            this._state === STATE$1.error
        ) {
            return this._ready;
        }
        return true;
    }

    _update(currentTime, triggerTextureUpdate = true) {
        this._rendered = true;
        let timeDelta = currentTime - this._currentTime;

        //update the current time
        this._currentTime = currentTime;

        //update the state
        if (
            this._state === STATE$1.waiting ||
            this._state === STATE$1.ended ||
            this._state === STATE$1.error
        )
            return false;

        this._triggerCallbacks("render", currentTime);

        if (currentTime < this._startTime) {
            clearTexture(this._gl, this._texture);
            this._state = STATE$1.sequenced;
        }

        if (
            currentTime >= this._startTime &&
            this._state !== STATE$1.paused &&
            this._state !== STATE$1.error
        ) {
            if (this._state !== STATE$1.playing) this._triggerCallbacks("play");
            this._state = STATE$1.playing;
        }

        if (currentTime >= this._stopTime) {
            clearTexture(this._gl, this._texture);
            this._triggerCallbacks("ended");
            this._state = STATE$1.ended;
        }

        //update this source nodes texture
        if (this._element === undefined || this._ready === false) return true;

        if (!this._renderPaused && this._state === STATE$1.paused) {
            if (triggerTextureUpdate) updateTexture(this._gl, this._texture, this._element);
            this._renderPaused = true;
        }
        if (this._state === STATE$1.playing) {
            if (triggerTextureUpdate) updateTexture(this._gl, this._texture, this._element);
            if (this._stretchPaused) {
                this._stopTime += timeDelta;
            }
        }

        return true;
    }

    /**
     * Clear any timeline state the node currently has, this puts the node in the "waiting" state, as if neither start nor stop had been called.
     */
    clearTimelineState() {
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._state = STATE$1.waiting;
    }

    /**
     * Destroy and clean-up the node.
     */
    destroy() {
        this._unload();
        super.destroy();
        this.unregisterCallback();
        delete this._element;
        this._elementURL = undefined;
        this._state = STATE$1.waiting;
        this._currentTime = 0;
        this._startTime = NaN;
        this._stopTime = Infinity;
        this._ready = false;
        this._loadCalled = false;
        this._gl.deleteTexture(this._texture);
        this._texture = undefined;
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

class MediaNode extends SourceNode {
    /**
     * Initialise an instance of a MediaNode.
     * This should not be called directly, but extended by other Node Types which use a `HTMLMediaElement`.
     */
    constructor(
        src,
        gl,
        renderGraph,
        currentTime,
        globalPlaybackRate = 1.0,
        sourceOffset = 0,
        preloadTime = 4,
        mediaElementCache = undefined,
        attributes = {}
    ) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._sourceOffset = sourceOffset;
        this._globalPlaybackRate = globalPlaybackRate;
        this._mediaElementCache = mediaElementCache;
        this._playbackRate = 1.0;
        this._playbackRateUpdated = true;
        this._attributes = Object.assign({ volume: 1.0 }, attributes);
        this._loopElement = false;
        this._isElementPlaying = false;
        if (this._attributes.loop) {
            this._loopElement = this._attributes.loop;
        }
    }

    set playbackRate(playbackRate) {
        this._playbackRate = playbackRate;
        this._playbackRateUpdated = true;
    }

    set stretchPaused(stretchPaused) {
        super.stretchPaused = stretchPaused;
        if (this._element) {
            if (this._stretchPaused) {
                this._element.pause();
            } else {
                if (this._state === STATE$1.playing) {
                    this._element.play();
                }
            }
        }
    }

    get stretchPaused() {
        return this._stretchPaused;
    }

    get playbackRate() {
        return this._playbackRate;
    }

    get elementURL() {
        return this._elementURL;
    }

    /**
     * @property {Boolean}
     * @summary - Check if the element is waiting on the network to continue playback
     */

    get _buffering() {
        if (this._element) {
            return this._element.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
        }

        return false;
    }

    set volume(volume) {
        this._attributes.volume = volume;
        if (this._element !== undefined) this._element.volume = this._attributes.volume;
    }

    _triggerLoad() {
        // If the user hasn't supplied an element, videocontext is responsible for the element
        if (this._isResponsibleForElementLifeCycle) {
            if (this._mediaElementCache) {
                /**
                 * Get a cached video element and also pass this instance so the
                 * cache can access the current play state.
                 */
                this._element = this._mediaElementCache.getElementAndLinkToNode(this);
            } else {
                this._element = document.createElement(this._elementType);
                this._element.setAttribute("crossorigin", "anonymous");
                this._element.setAttribute("webkit-playsinline", "");
                this._element.setAttribute("playsinline", "");
                // This seems necessary to allow using video as a texture. See:
                // https://bugs.chromium.org/p/chromium/issues/detail?id=898550
                // https://github.com/pixijs/pixi.js/issues/5996
                this._element.preload = "auto";
                this._playbackRateUpdated = true;
            }
            this._element.volume = this._attributes.volume;
            if (window.MediaStream !== undefined && this._elementURL instanceof MediaStream) {
                this._element.srcObject = this._elementURL;
            } else {
                this._element.src = this._elementURL;
            }
        }
        // at this stage either the user or the element cache should have provided an element
        if (this._element) {
            for (let key in this._attributes) {
                this._element[key] = this._attributes[key];
            }

            let currentTimeOffset = 0;
            if (this._currentTime > this._startTime)
                currentTimeOffset = this._currentTime - this._startTime;
            this._element.currentTime = this._sourceOffset + currentTimeOffset;
            this._element.onerror = () => {
                if (this._element === undefined) return;
                console.debug("Error with element", this._element);
                this._state = STATE$1.error;
                //Event though there's an error ready should be set to true so the node can output transparenn
                this._ready = true;
                this._triggerCallbacks("error");
            };
        } else {
            // If the element doesn't exist for whatever reason enter the error state.
            this._state = STATE$1.error;
            this._ready = true;
            this._triggerCallbacks("error");
        }

        this._loadTriggered = true;
    }

    /**
     * _load has two functions:
     *
     * 1. `_triggerLoad` which ensures the element has the correct src and is at the correct currentTime,
     *     so that the browser can start fetching media.
     *
     * 2.  `shouldPollForElementReadyState` waits until the element has a "readState" that signals there
     *     is enough media to start playback. This is a little confusing as currently structured.
     *     We're using the _update loop to poll the _load function which checks the element status.
     *     When ready we fire off the "loaded callback"
     *
     */

    _load() {
        super._load();

        /**
         * We've got to be careful here as _load is called many times whilst waiting for the element to buffer
         * and this function should only be called once.
         * This is step one in what should be a more thorough refactor
         */
        if (!this._loadTriggered) {
            this._triggerLoad();
        }

        const shouldPollForElementReadyState = this._element !== undefined;
        /**
         * this expression is effectively polling the element, waiting for it to buffer
         * it gets called a lot of time
         */
        if (shouldPollForElementReadyState) {
            if (this._element.readyState > 3 && !this._element.seeking) {
                // at this point the element has enough data for current playback position
                // and at least a couple of frames into the future

                // Check if the duration has changed. Update if necessary.
                // this could potentially go in the normal update loop but I don't want to change
                // too many things at once
                if (this._loopElement === false) {
                    if (this._stopTime === Infinity || this._stopTime == undefined) {
                        this._stopTime = this._startTime + this._element.duration;
                        this._triggerCallbacks("durationchange", this.duration);
                    }
                }

                // signal to user that this node has "loaded"
                if (this._ready !== true) {
                    this._triggerCallbacks("loaded");
                    this._playbackRateUpdated = true;
                }

                this._ready = true;
            } else {
                if (this._state !== STATE$1.error) {
                    this._ready = false;
                }
            }
        }
    }

    _unload() {
        super._unload();
        if (this._isResponsibleForElementLifeCycle && this._element !== undefined) {
            this._element.removeAttribute("src");
            this._element.srcObject = undefined;
            this._element.load();
            for (let key in this._attributes) {
                this._element.removeAttribute(key);
            }
            // Unlink this form the cache, freeing up the element for another media node
            if (this._mediaElementCache)
                this._mediaElementCache.unlinkNodeFromElement(this._element);
            this._element = undefined;
            if (!this._mediaElementCache) delete this._element;
        }
        // reset class to initial state
        this._ready = false;
        this._isElementPlaying = false;
        // For completeness. I couldn't find a path that required reuse of this._loadTriggered after _unload.
        this._loadTriggered = false;
    }

    _seek(time) {
        super._seek(time);
        if (this.state === STATE$1.playing || this.state === STATE$1.paused) {
            if (this._element === undefined) this._load();
            let relativeTime = this._currentTime - this._startTime + this._sourceOffset;
            this._element.currentTime = relativeTime;
            this._ready = false;
        }
        if (
            (this._state === STATE$1.sequenced || this._state === STATE$1.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime, triggerTextureUpdate = true) {
        //if (!super._update(currentTime)) return false;
        super._update(currentTime, triggerTextureUpdate);
        //check if the media has ended
        if (this._element !== undefined) {
            if (this._element.ended) {
                this._state = STATE$1.ended;
                this._triggerCallbacks("ended");
            }
        }

        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== STATE$1.waiting &&
            this._state !== STATE$1.ended
        )
            this._load();

        if (this._state === STATE$1.playing) {
            if (this._playbackRateUpdated) {
                this._element.playbackRate = this._globalPlaybackRate * this._playbackRate;
                this._playbackRateUpdated = false;
            }
            if (!this._isElementPlaying) {
                this._element.play();
                if (this._stretchPaused) {
                    this._element.pause();
                }
                this._isElementPlaying = true;
            }
            return true;
        } else if (this._state === STATE$1.paused) {
            this._element.pause();
            this._isElementPlaying = false;
            return true;
        } else if (this._state === STATE$1.ended && this._element !== undefined) {
            this._element.pause();
            if (this._isElementPlaying) {
                this._unload();
            }
            return false;
        }
    }

    clearTimelineState() {
        super.clearTimelineState();
        if (this._element !== undefined) {
            this._element.pause();
            this._isElementPlaying = false;
        }
        this._unload();
    }

    destroy() {
        if (this._element) this._element.pause();
        super.destroy();
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$8 = "VideoNode";

class VideoNode extends MediaNode {
    /**
     * Initialise an instance of a VideoNode.
     * This should not be called directly, but created through a call to videoContext.createVideoNode();
     */
    constructor() {
        super(...arguments);
        this._displayName = TYPE$8;
        this._elementType = "video";
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$7 = "CanvasNode";
class CanvasNode extends SourceNode {
    /**
     * Initialise an instance of a CanvasNode.
     * This should not be called directly, but created through a call to videoContext.createCanvasNode();
     */
    constructor(canvas, gl, renderGraph, currentTime, preloadTime = 4) {
        super(canvas, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._displayName = TYPE$7;
    }

    _load() {
        super._load();
        this._ready = true;
        this._triggerCallbacks("loaded");
    }

    _unload() {
        super._unload();
        this._ready = false;
    }

    _seek(time) {
        super._seek(time);
        if (this.state === STATE$1.playing || this.state === STATE$1.paused) {
            if (this._element === undefined) this._load();
            this._ready = false;
        }
        if (
            (this._state === STATE$1.sequenced || this._state === STATE$1.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime) {
        //if (!super._update(currentTime)) return false;
        super._update(currentTime);
        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== STATE$1.waiting &&
            this._state !== STATE$1.ended
        )
            this._load();

        if (this._state === STATE$1.playing) {
            return true;
        } else if (this._state === STATE$1.paused) {
            return true;
        } else if (this._state === STATE$1.ended && this._element !== undefined) {
            this._unload();
            return false;
        }
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$6 = "CanvasNode";
class ImageNode extends SourceNode {
    /**
     * Initialise an instance of an ImageNode.
     * This should not be called directly, but created through a call to videoContext.createImageNode();
     */
    constructor(src, gl, renderGraph, currentTime, preloadTime = 4, attributes = {}) {
        super(src, gl, renderGraph, currentTime);
        this._preloadTime = preloadTime;
        this._attributes = attributes;
        this._textureUploaded = false;
        this._displayName = TYPE$6;
    }

    get elementURL() {
        return this._elementURL;
    }

    _load() {
        if (this._image !== undefined) {
            for (var key in this._attributes) {
                this._image[key] = this._attributes[key];
            }
            return;
        }
        if (this._isResponsibleForElementLifeCycle) {
            super._load();
            this._image = new Image();
            this._image.setAttribute("crossorigin", "anonymous");
            // It's important to set the `onload` event before the `src` property
            // https://stackoverflow.com/questions/12354865/image-onload-event-and-browser-cache?answertab=active#tab-top
            this._image.onload = () => {
                this._ready = true;
                if (window.createImageBitmap) {
                    window
                        .createImageBitmap(
                            this._image,
                            0,
                            0,
                            this._image.width,
                            this._image.height,
                            { imageOrientation: "flipY" }
                        )
                        .then(imageBitmap => {
                            this._element = imageBitmap;
                            this._triggerCallbacks("loaded");
                        });
                } else {
                    this._element = this._image;
                    this._triggerCallbacks("loaded");
                }
            };
            this._image.src = this._elementURL;
            this._image.onerror = () => {
                console.error("ImageNode failed to load. url:", this._elementURL);
            };

            for (let key in this._attributes) {
                this._image[key] = this._attributes[key];
            }
        }
        this._image.onerror = () => {
            console.debug("Error with element", this._image);
            this._state = STATE$1.error;
            //Event though there's an error ready should be set to true so the node can output transparenn
            this._ready = true;
            this._triggerCallbacks("error");
        };
    }

    _unload() {
        super._unload();
        if (this._isResponsibleForElementLifeCycle) {
            if (this._image !== undefined) {
                this._image.src = "";
                this._image.onerror = undefined;
                this._image = undefined;
                delete this._image;
            }
            if (this._element instanceof window.ImageBitmap) {
                this._element.close();
            }
        }
        this._ready = false;
    }

    _seek(time) {
        super._seek(time);
        if (this.state === STATE$1.playing || this.state === STATE$1.paused) {
            if (this._image === undefined) this._load();
        }
        if (
            (this._state === STATE$1.sequenced || this._state === STATE$1.ended) &&
            this._element !== undefined
        ) {
            this._unload();
        }
    }

    _update(currentTime) {
        //if (!super._update(currentTime)) return false;
        if (this._textureUploaded) {
            super._update(currentTime, false);
        } else {
            super._update(currentTime);
        }

        if (
            this._startTime - this._currentTime <= this._preloadTime &&
            this._state !== STATE$1.waiting &&
            this._state !== STATE$1.ended
        )
            this._load();

        if (this._state === STATE$1.playing) {
            return true;
        } else if (this._state === STATE$1.paused) {
            return true;
        } else if (this._state === STATE$1.ended && this._image !== undefined) {
            this._unload();
            return false;
        }
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015
function ConnectException(message) {
    this.message = message;
    this.name = "ConnectionException";
}

function RenderException(message) {
    this.message = message;
    this.name = "RenderException";
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$5 = "ProcessingNode";

class ProcessingNode extends GraphNode {
    /**
     * Initialise an instance of a ProcessingNode.
     *
     * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
     */
    constructor(gl, renderGraph, definition, inputNames, limitConnections) {
        super(gl, renderGraph, inputNames, limitConnections);
        this._vertexShader = compileShader(gl, definition.vertexShader, gl.VERTEX_SHADER);
        this._fragmentShader = compileShader(gl, definition.fragmentShader, gl.FRAGMENT_SHADER);
        this._definition = definition;
        this._properties = {}; //definition.properties;
        //copy definition properties
        for (let propertyName in definition.properties) {
            let propertyValue = definition.properties[propertyName].value;
            //if an array then shallow copy it
            if (Object.prototype.toString.call(propertyValue) === "[object Array]") {
                propertyValue = definition.properties[propertyName].value.slice();
            }
            let propertyType = definition.properties[propertyName].type;
            this._properties[propertyName] = {
                type: propertyType,
                value: propertyValue
            };
        }

        this._shaderInputsTextureUnitMapping = [];
        this._maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this._boundTextureUnits = 0;
        this._texture = createElementTexture(gl);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.canvas.width,
            gl.canvas.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );
        //compile the shader
        this._program = createShaderProgram(gl, this._vertexShader, this._fragmentShader);

        //create and setup the framebuffer
        this._framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture,
            0
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        //create properties on this object for the passed properties
        for (let propertyName in this._properties) {
            Object.defineProperty(this, propertyName, {
                get: function() {
                    return this._properties[propertyName].value;
                },
                set: function(passedValue) {
                    this._properties[propertyName].value = passedValue;
                }
            });
        }

        //create texutres for any texture properties
        for (let propertyName in this._properties) {
            let propertyValue = this._properties[propertyName].value;
            if (propertyValue instanceof Image) {
                this._properties[propertyName].texture = createElementTexture(gl);
                this._properties[propertyName].textureUnit = gl.TEXTURE0 + this._boundTextureUnits;
                this._properties[propertyName].textureUnitIndex = this._boundTextureUnits;
                this._boundTextureUnits += 1;
                if (this._boundTextureUnits > this._maxTextureUnits) {
                    throw new RenderException(
                        "Trying to bind more than available textures units to shader"
                    );
                }
            }
        }

        // calculate texture units for input textures
        for (let inputName of definition.inputs) {
            this._shaderInputsTextureUnitMapping.push({
                name: inputName,
                textureUnit: gl.TEXTURE0 + this._boundTextureUnits,
                textureUnitIndex: this._boundTextureUnits,
                location: gl.getUniformLocation(this._program, inputName)
            });
            this._boundTextureUnits += 1;
            if (this._boundTextureUnits > this._maxTextureUnits) {
                throw new RenderException(
                    "Trying to bind more than available textures units to shader"
                );
            }
        }

        //find the locations of the properties in the compiled shader
        for (let propertyName in this._properties) {
            if (this._properties[propertyName].type === "uniform") {
                this._properties[propertyName].location = this._gl.getUniformLocation(
                    this._program,
                    propertyName
                );
            }
        }
        this._currentTimeLocation = this._gl.getUniformLocation(this._program, "currentTime");
        this._currentTime = 0;

        //Other setup
        let positionLocation = gl.getAttribLocation(this._program, "a_position");
        let buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([1.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0]),
            gl.STATIC_DRAW
        );
        let texCoordLocation = gl.getAttribLocation(this._program, "a_texCoord");
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
        this._displayName = TYPE$5;
    }

    /**
     * Sets the passed processing node property to the passed value.
     * @param {string} name - The name of the processing node parameter to modify.
     * @param {Object} value - The value to set it to.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * monoNode.setProperty("inputMix", [1.0,0.0,0.0]); //Just use red channel
     */
    setProperty(name, value) {
        this._properties[name].value = value;
    }

    /**
     * Sets the passed processing node property to the passed value.
     * @param {string} name - The name of the processing node parameter to get.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * console.log(monoNode.getProperty("inputMix")); //Will output [0.4,0.6,0.2], the default value from the effect definition.
     *
     */
    getProperty(name) {
        return this._properties[name].value;
    }

    /**
     * Destroy and clean-up the node.
     */
    destroy() {
        super.destroy();
        //destrpy texutres for any texture properties
        for (let propertyName in this._properties) {
            let propertyValue = this._properties[propertyName].value;
            if (propertyValue instanceof Image) {
                this._gl.deleteTexture(this._properties[propertyName].texture);
                this._texture = undefined;
            }
        }
        //Destroy main
        this._gl.deleteTexture(this._texture);
        this._texture = undefined;
        //Detach shaders
        this._gl.detachShader(this._program, this._vertexShader);
        this._gl.detachShader(this._program, this._fragmentShader);
        //Delete shaders
        this._gl.deleteShader(this._vertexShader);
        this._gl.deleteShader(this._fragmentShader);
        //Delete program
        this._gl.deleteProgram(this._program);
        //Delete Framebuffer
        this._gl.deleteFramebuffer(this._framebuffer);
    }

    _update(currentTime) {
        this._currentTime = currentTime;
    }

    _seek(currentTime) {
        this._currentTime = currentTime;
    }

    _render() {
        this._rendered = true;
        let gl = this._gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this._program);

        //upload the default uniforms
        gl.uniform1f(this._currentTimeLocation, parseFloat(this._currentTime));

        for (let propertyName in this._properties) {
            let propertyValue = this._properties[propertyName].value;
            let propertyType = this._properties[propertyName].type;
            let propertyLocation = this._properties[propertyName].location;
            if (propertyType !== "uniform") continue;

            if (typeof propertyValue === "number") {
                gl.uniform1f(propertyLocation, propertyValue);
            } else if (Object.prototype.toString.call(propertyValue) === "[object Array]") {
                if (propertyValue.length === 1) {
                    gl.uniform1fv(propertyLocation, propertyValue);
                } else if (propertyValue.length === 2) {
                    gl.uniform2fv(propertyLocation, propertyValue);
                } else if (propertyValue.length === 3) {
                    gl.uniform3fv(propertyLocation, propertyValue);
                } else if (propertyValue.length === 4) {
                    gl.uniform4fv(propertyLocation, propertyValue);
                } else {
                    console.debug(
                        "Shader parameter",
                        propertyName,
                        "is too long an array:",
                        propertyValue
                    );
                }
            } else if (propertyValue instanceof Image) {
                let texture = this._properties[propertyName].texture;
                let textureUnit = this._properties[propertyName].textureUnit;
                let textureUnitIndex = this._properties[propertyName].textureUnit;
                updateTexture(gl, texture, propertyValue);

                gl.activeTexture(textureUnit);
                gl.uniform1i(propertyLocation, textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            } else ;
        }
    }
}

var fragmentShader = "precision mediump float;\nuniform sampler2D u_image;\nvarying vec2 v_texCoord;\nvarying float v_progress;\nvoid main(){\n    gl_FragColor = texture2D(u_image, v_texCoord);\n}\n";

var vertexShader = "attribute vec2 a_position;\nattribute vec2 a_texCoord;\nvarying vec2 v_texCoord;\nvoid main() {\n    gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\n    v_texCoord = a_texCoord;\n}\n";

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$4 = "DestinationNode";

class DestinationNode extends ProcessingNode {
    /**
     * Initialise an instance of a DestinationNode.
     *
     * There should only be a single instance of a DestinationNode per VideoContext instance. An VideoContext's destination can be accessed like so: videoContext.desitnation.
     *
     * You should not instantiate this directly.
     */
    constructor(gl, renderGraph) {
        let definition = {
            fragmentShader,
            vertexShader,
            properties: {},
            inputs: ["u_image"]
        };

        super(gl, renderGraph, definition, definition.inputs, false);
        this._displayName = TYPE$4;
    }

    _render() {
        let gl = this._gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.clearColor(0, 0, 0, 0.0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.inputs.forEach(node => {
            super._render();
            //map the input textures input the node
            var texture = node._texture;

            for (let mapping of this._shaderInputsTextureUnitMapping) {
                gl.activeTexture(mapping.textureUnit);
                gl.uniform1i(mapping.location, mapping.textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$3 = "EffectNode";

class EffectNode extends ProcessingNode {
    /**
     * Initialise an instance of an EffectNode. You should not instantiate this directly, but use VideoContest.createEffectNode().
     */
    constructor(gl, renderGraph, definition) {
        let placeholderTexture = createElementTexture(gl);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );

        super(gl, renderGraph, definition, definition.inputs, true);

        this._placeholderTexture = placeholderTexture;
        this._displayName = TYPE$3;
    }

    _render() {
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture,
            0
        );
        gl.clearColor(0, 0, 0, 0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFunc(gl.ONE, gl.ZERO);

        super._render();

        let inputs = this._renderGraph.getInputsForNode(this);

        for (var i = 0; i < this._shaderInputsTextureUnitMapping.length; i++) {
            let inputTexture = this._placeholderTexture;
            let textureUnit = this._shaderInputsTextureUnitMapping[i].textureUnit;
            if (i < inputs.length && inputs[i] !== undefined) {
                inputTexture = inputs[i]._texture;
            }

            gl.activeTexture(textureUnit);
            gl.uniform1i(
                this._shaderInputsTextureUnitMapping[i].location,
                this._shaderInputsTextureUnitMapping[i].textureUnitIndex
            );
            gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$2 = "TransitionNode";

class TransitionNode extends EffectNode {
    /**
     * Initialise an instance of a TransitionNode. You should not instantiate this directly, but use VideoContest.createTransitonNode().
     */
    constructor(gl, renderGraph, definition) {
        super(gl, renderGraph, definition);
        this._transitions = {};

        //save a version of the original property values
        this._initialPropertyValues = {};
        for (let propertyName in this._properties) {
            this._initialPropertyValues[propertyName] = this._properties[propertyName].value;
        }
        this._displayName = TYPE$2;
    }

    _doesTransitionFitOnTimeline(testTransition) {
        if (this._transitions[testTransition.property] === undefined) return true;
        for (let transition of this._transitions[testTransition.property]) {
            if (testTransition.start > transition.start && testTransition.start < transition.end)
                return false;
            if (testTransition.end > transition.start && testTransition.end < transition.end)
                return false;
            if (transition.start > testTransition.start && transition.start < testTransition.end)
                return false;
            if (transition.end > testTransition.start && transition.end < testTransition.end)
                return false;
        }
        return true;
    }

    _insertTransitionInTimeline(transition) {
        if (this._transitions[transition.property] === undefined)
            this._transitions[transition.property] = [];
        this._transitions[transition.property].push(transition);

        this._transitions[transition.property].sort(function(a, b) {
            return a.start - b.start;
        });
    }

    /**
     * Create a transition on the timeline.
     *
     * @param {number} startTime - The time at which the transition should start (relative to currentTime of video context).
     * @param {number} endTime - The time at which the transition should be completed by (relative to currentTime of video context).
     * @param {number} currentValue - The value to start the transition at.
     * @param {number} targetValue - The value to transition to by endTime.
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
     *
     * @return {Boolean} returns True if a transition is successfully added, false otherwise.
     */
    transition(startTime, endTime, currentValue, targetValue, propertyName = "mix") {
        let transition = {
            start: startTime + this._currentTime,
            end: endTime + this._currentTime,
            current: currentValue,
            target: targetValue,
            property: propertyName
        };
        if (!this._doesTransitionFitOnTimeline(transition)) return false;
        this._insertTransitionInTimeline(transition);
        return true;
    }

    /**
     * Create a transition on the timeline at an absolute time.
     *
     * @param {number} startTime - The time at which the transition should start (relative to time 0).
     * @param {number} endTime - The time at which the transition should be completed by (relative to time 0).
     * @param {number} currentValue - The value to start the transition at.
     * @param {number} targetValue - The value to transition to by endTime.
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
     *
     * @return {Boolean} returns True if a transition is successfully added, false otherwise.
     */
    transitionAt(startTime, endTime, currentValue, targetValue, propertyName = "mix") {
        let transition = {
            start: startTime,
            end: endTime,
            current: currentValue,
            target: targetValue,
            property: propertyName
        };
        if (!this._doesTransitionFitOnTimeline(transition)) return false;
        this._insertTransitionInTimeline(transition);
        return true;
    }

    /**
     * Clear all transistions on the passed property. If no property is defined clear all transitions on the node.
     *
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
     */
    clearTransitions(propertyName) {
        if (propertyName === undefined) {
            this._transitions = {};
        } else {
            this._transitions[propertyName] = [];
        }
    }

    /**
     * Clear a transistion on the passed property that the specified time lies within.
     *
     * @param {String} propertyName - The name of the property to clear a transition on.
     * @param {number} time - A time which lies within the property you're trying to clear.
     *
     * @return {Boolean} returns True if a transition is removed, false otherwise.
     */
    clearTransition(propertyName, time) {
        let transitionIndex = undefined;
        for (var i = 0; i < this._transitions[propertyName].length; i++) {
            let transition = this._transitions[propertyName][i];
            if (time > transition.start && time < transition.end) {
                transitionIndex = i;
            }
        }
        if (transitionIndex !== undefined) {
            this._transitions[propertyName].splice(transitionIndex, 1);
            return true;
        }
        return false;
    }

    _update(currentTime) {
        super._update(currentTime);
        for (let propertyName in this._transitions) {
            let value = this[propertyName];
            if (this._transitions[propertyName].length > 0) {
                value = this._transitions[propertyName][0].current;
            }
            let transitionActive = false;

            for (var i = 0; i < this._transitions[propertyName].length; i++) {
                let transition = this._transitions[propertyName][i];
                if (currentTime > transition.end) {
                    value = transition.target;
                    continue;
                }

                if (currentTime > transition.start && currentTime < transition.end) {
                    let difference = transition.target - transition.current;
                    let progress =
                        (this._currentTime - transition.start) /
                        (transition.end - transition.start);
                    transitionActive = true;
                    this[propertyName] = transition.current + difference * progress;
                    break;
                }
            }

            if (!transitionActive) this[propertyName] = value;
        }
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE$1 = "CompositingNode";

class CompositingNode extends ProcessingNode {
    /**
     * Initialise an instance of a Compositing Node. You should not instantiate this directly, but use VideoContest.createCompositingNode().
     */
    constructor(gl, renderGraph, definition) {
        let placeholderTexture = createElementTexture(gl);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );
        super(gl, renderGraph, definition, definition.inputs, false);
        this._placeholderTexture = placeholderTexture;
        this._displayName = TYPE$1;
    }

    _render() {
        let gl = this._gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._framebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            this._texture,
            0
        );
        gl.clearColor(0, 0, 0, 0); // green;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        this.inputs.forEach(node => {
            if (node === undefined) return;
            super._render();

            //map the input textures input the node
            var texture = node._texture;

            for (let mapping of this._shaderInputsTextureUnitMapping) {
                gl.activeTexture(mapping.textureUnit);
                gl.uniform1i(mapping.location, mapping.textureUnitIndex);
                gl.bindTexture(gl.TEXTURE_2D, texture);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

/*
 * Utility function to compile a WebGL Vertex or Fragment shader.
 *
 * @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
 * @param {String} shaderSource - A string of shader code to compile.
 * @param {number} shaderType - Shader type, either WebGLRenderingContext.VERTEX_SHADER or WebGLRenderingContext.FRAGMENT_SHADER.
 *
 * @return {WebGLShader} A compiled shader.
 *
 */
function compileShader(gl, shaderSource, shaderType) {
    let shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}

/*
 * Create a shader program from a passed vertex and fragment shader source string.
 *
 * @param {WebGLRenderingContext} gl - the webgl context fo which to build the shader.
 * @param {WebGLShader} vertexShader - A compiled vertex shader.
 * @param {WebGLShader} fragmentShader - A compiled fragment shader.
 *
 * @return {WebGLProgram} A compiled & linkde shader program.
 */
function createShaderProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw {
            error: 4,
            msg: "Can't link shader program for track",
            toString: function() {
                return this.msg;
            }
        };
    }
    return program;
}

function createElementTexture(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //Initialise the texture untit to clear.
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, type);

    return texture;
}

function updateTexture(gl, texture, element) {
    if (element.readyState !== undefined && element.readyState === 0) return;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);

    texture._isTextureCleared = false;
}

function clearTexture(gl, texture) {
    // A quick check to ensure we don't call 'texImage2D' when the texture has already been 'cleared' #performance
    if (!texture._isTextureCleared) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            1,
            1,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 0, 0])
        );

        texture._isTextureCleared = true;
    }
}

function generateRandomId() {
    const appearanceAdjective = [
        "adorable",
        "alert",
        "average",
        "beautiful",
        "blonde",
        "bloody",
        "blushing",
        "bright",
        "clean",
        "clear",
        "cloudy",
        "colourful",
        "concerned",
        "crowded",
        "curious",
        "cute",
        "dark",
        "dirty",
        "drab",
        "distinct",
        "dull",
        "elegant",
        "fancy",
        "filthy",
        "glamorous",
        "gleaming",
        "graceful",
        "grotesque",
        "homely",
        "light",
        "misty",
        "motionless",
        "muddy",
        "plain",
        "poised",
        "quaint",
        "scary",
        "shiny",
        "smoggy",
        "sparkling",
        "spotless",
        "stormy",
        "strange",
        "ugly",
        "unsightly",
        "unusual"
    ];
    const conditionAdjective = [
        "alive",
        "brainy",
        "broken",
        "busy",
        "careful",
        "cautious",
        "clever",
        "crazy",
        "damaged",
        "dead",
        "difficult",
        "easy",
        "fake",
        "false",
        "famous",
        "forward",
        "fragile",
        "guilty",
        "helpful",
        "helpless",
        "important",
        "impossible",
        "infamous",
        "innocent",
        "inquisitive",
        "mad",
        "modern",
        "open",
        "outgoing",
        "outstanding",
        "poor",
        "powerful",
        "puzzled",
        "real",
        "rich",
        "right",
        "robust",
        "sane",
        "scary",
        "shy",
        "sleepy",
        "stupid",
        "super",
        "tame",
        "thick",
        "tired",
        "wild",
        "wrong"
    ];
    const nounAnimal = [
        "manatee",
        "gila monster",
        "nematode",
        "seahorse",
        "slug",
        "koala bear",
        "giant tortoise",
        "garden snail",
        "starfish",
        "sloth",
        "american woodcock",
        "coral",
        "swallowtail butterfly",
        "house sparrow",
        "sea anemone"
    ];

    function randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function capitalize(word) {
        word = word.replace(/\b\w/g, l => l.toUpperCase());
        return word;
    }

    let name =
        randomChoice(appearanceAdjective) +
        " " +
        randomChoice(conditionAdjective) +
        " " +
        randomChoice(nounAnimal);
    name = capitalize(name);
    name = name.replace(/ /g, "-");
    return name;
}

function exportToJSON(vc) {
    console.warn(
        "VideoContext.exportToJSON has been deprecated. Please use VideoContext.snapshot instead."
    );
    return JSON.stringify(snapshotNodes(vc));
}

function snapshot(vc) {
    return {
        nodes: snapshotNodes(vc),
        videoContext: snapshotVideoContext(vc)
    };
}

function snapshotVideoContext(vc) {
    return {
        currentTime: vc.currentTime,
        duration: vc.duration,
        state: vc.state,
        playbackRate: vc.playbackRate
    };
}

let warningExportSourceLogged = false;
function snapshotNodes(vc) {
    function qualifyURL(url) {
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    }

    function getInputIDs(node, vc) {
        let inputs = [];
        for (let input of node.inputs) {
            if (input === undefined) continue;
            let inputID;
            let inputIndex = node.inputs.indexOf(input);
            let index = vc._processingNodes.indexOf(input);
            if (index > -1) {
                inputID = "processor" + index;
            } else {
                let index = vc._sourceNodes.indexOf(input);
                if (index > -1) {
                    inputID = "source" + index;
                } else {
                    console.log("Warning, can't find input", input);
                }
            }
            inputs.push({ id: inputID, index: inputIndex });
        }
        return inputs;
    }

    let result = {};

    let sourceNodeStateMapping = [];
    for (let state in STATE$1) {
        sourceNodeStateMapping[STATE$1[state]] = state;
    }

    for (let index in vc._sourceNodes) {
        let source = vc._sourceNodes[index];
        let id = "source" + index;
        let node_url = "";

        if (!source._isResponsibleForElementLifeCycle) {
            if (!warningExportSourceLogged) {
                console.debug(
                    "Warning - Trying to export source created from an element not a URL. URL of export will be set to the elements src attribute and may be incorrect",
                    source
                );
                warningExportSourceLogged = true;
            }
            node_url = source.element.src;
        } else {
            node_url = qualifyURL(source._elementURL);
        }

        let node = {
            type: source.displayName,
            url: node_url,
            start: source.startTime,
            stop: source.stopTime,
            state: sourceNodeStateMapping[source.state]
        };
        if (node.type === TYPE$8) {
            node.currentTime = null;
            if (source.element && source.element.currentTime) {
                node.currentTime = source.element.currentTime;
            }
        }

        if (source._sourceOffset) {
            node.sourceOffset = source._sourceOffset;
        }
        result[id] = node;
    }

    for (let index in vc._processingNodes) {
        let processor = vc._processingNodes[index];
        let id = "processor" + index;
        let node = {
            type: processor.displayName,
            definition: processor._definition,
            inputs: getInputIDs(processor, vc),
            properties: {}
        };

        for (let property in node.definition.properties) {
            node.properties[property] = processor[property];
        }

        if (node.type === TYPE$2) {
            node.transitions = processor._transitions;
        }

        result[id] = node;
    }

    result["destination"] = {
        type: "Destination",
        inputs: getInputIDs(vc.destination, vc)
    };

    return result;
}

function createControlFormForNode(node, nodeName) {
    let rootDiv = document.createElement("div");

    if (nodeName !== undefined) {
        var title = document.createElement("h2");
        title.innerHTML = nodeName;
        rootDiv.appendChild(title);
    }

    for (let propertyName in node._properties) {
        let propertyParagraph = document.createElement("p");
        let propertyTitleHeader = document.createElement("h3");
        propertyTitleHeader.innerHTML = propertyName;
        propertyParagraph.appendChild(propertyTitleHeader);

        let propertyValue = node._properties[propertyName].value;
        if (typeof propertyValue === "number") {
            let range = document.createElement("input");
            range.setAttribute("type", "range");
            range.setAttribute("min", "0");
            range.setAttribute("max", "1");
            range.setAttribute("step", "0.01");
            range.setAttribute("value", propertyValue, toString());

            let number = document.createElement("input");
            number.setAttribute("type", "number");
            number.setAttribute("min", "0");
            number.setAttribute("max", "1");
            number.setAttribute("step", "0.01");
            number.setAttribute("value", propertyValue, toString());

            let mouseDown = false;
            range.onmousedown = function() {
                mouseDown = true;
            };
            range.onmouseup = function() {
                mouseDown = false;
            };
            range.onmousemove = function() {
                if (mouseDown) {
                    node[propertyName] = parseFloat(range.value);
                    number.value = range.value;
                }
            };
            range.onchange = function() {
                node[propertyName] = parseFloat(range.value);
                number.value = range.value;
            };
            number.onchange = function() {
                node[propertyName] = parseFloat(number.value);
                range.value = number.value;
            };
            propertyParagraph.appendChild(range);
            propertyParagraph.appendChild(number);
        } else if (Object.prototype.toString.call(propertyValue) === "[object Array]") {
            for (var i = 0; i < propertyValue.length; i++) {
                let range = document.createElement("input");
                range.setAttribute("type", "range");
                range.setAttribute("min", "0");
                range.setAttribute("max", "1");
                range.setAttribute("step", "0.01");
                range.setAttribute("value", propertyValue[i], toString());

                let number = document.createElement("input");
                number.setAttribute("type", "number");
                number.setAttribute("min", "0");
                number.setAttribute("max", "1");
                number.setAttribute("step", "0.01");
                number.setAttribute("value", propertyValue, toString());

                let index = i;
                let mouseDown = false;
                range.onmousedown = function() {
                    mouseDown = true;
                };
                range.onmouseup = function() {
                    mouseDown = false;
                };
                range.onmousemove = function() {
                    if (mouseDown) {
                        node[propertyName][index] = parseFloat(range.value);
                        number.value = range.value;
                    }
                };
                range.onchange = function() {
                    node[propertyName][index] = parseFloat(range.value);
                    number.value = range.value;
                };

                number.onchange = function() {
                    node[propertyName][index] = parseFloat(number.value);
                    range.value = number.value;
                };
                propertyParagraph.appendChild(range);
                propertyParagraph.appendChild(number);
            }
        }

        rootDiv.appendChild(propertyParagraph);
    }
    return rootDiv;
}

function calculateNodeDepthFromDestination(videoContext) {
    let destination = videoContext.destination;
    let depthMap = new Map();
    depthMap.set(destination, 0);

    function itterateBackwards(node, depth = 0) {
        for (let n of node.inputs) {
            let d = depth + 1;
            if (depthMap.has(n)) {
                if (d > depthMap.get(n)) {
                    depthMap.set(n, d);
                }
            } else {
                depthMap.set(n, d);
            }
            itterateBackwards(n, depthMap.get(n));
        }
    }

    itterateBackwards(destination);
    return depthMap;
}

function visualiseVideoContextGraph(videoContext, canvas) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    let nodeDepths = calculateNodeDepthFromDestination(videoContext);
    let depths = nodeDepths.values();
    depths = Array.from(depths).sort(function(a, b) {
        return b - a;
    });
    let maxDepth = depths[0];

    let xStep = w / (maxDepth + 1);

    let nodeHeight = h / videoContext._sourceNodes.length / 3;
    let nodeWidth = nodeHeight * 1.618;

    function calculateNodePos(node, nodeDepths, xStep, nodeHeight) {
        let depth = nodeDepths.get(node);
        nodeDepths.values();

        let count = 0;
        for (let nodeDepth of nodeDepths) {
            if (nodeDepth[0] === node) break;
            if (nodeDepth[1] === depth) count += 1;
        }
        return {
            x: xStep * nodeDepths.get(node),
            y: nodeHeight * 1.5 * count + 50
        };
    }

    // "video":["#572A72", "#3C1255"],
    // "image":["#7D9F35", "#577714"],
    // "canvas":["#AA9639", "#806D15"]

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        let source = calculateNodePos(conn.source, nodeDepths, xStep, nodeHeight);
        let destination = calculateNodePos(conn.destination, nodeDepths, xStep, nodeHeight);
        if (source !== undefined && destination !== undefined) {
            ctx.beginPath();
            //ctx.moveTo(source.x + nodeWidth/2, source.y + nodeHeight/2);
            let x1 = source.x + nodeWidth / 2;
            let y1 = source.y + nodeHeight / 2;
            let x2 = destination.x + nodeWidth / 2;
            let y2 = destination.y + nodeHeight / 2;
            let dx = x2 - x1;
            let dy = y2 - y1;

            let angle = Math.PI / 2 - Math.atan2(dx, dy);

            let distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

            let midX = Math.min(x1, x2) + (Math.max(x1, x2) - Math.min(x1, x2)) / 2;
            let midY = Math.min(y1, y2) + (Math.max(y1, y2) - Math.min(y1, y2)) / 2;

            let testX = (Math.cos(angle + Math.PI / 2) * distance) / 1.5 + midX;
            let testY = (Math.sin(angle + Math.PI / 2) * distance) / 1.5 + midY;
            // console.log(testX, testY);

            ctx.arc(testX, testY, distance / 1.2, angle - Math.PI + 0.95, angle - 0.95);

            //ctx.arcTo(source.x + nodeWidth/2 ,source.y + nodeHeight/2,destination.x + nodeWidth/2,destination.y + nodeHeight/2,100);
            //ctx.lineTo(midX, midY);
            ctx.stroke();
            //ctx.endPath();
        }
    }

    for (let node of nodeDepths.keys()) {
        let pos = calculateNodePos(node, nodeDepths, xStep, nodeHeight);
        let color = "#AA9639";
        let text = "";
        if (node.displayName === TYPE$1) {
            color = "#000000";
        }
        if (node.displayName === TYPE$4) {
            color = "#7D9F35";
            text = "Output";
        }
        if (node.displayName === TYPE$8) {
            color = "#572A72";
            text = "Video";
        }
        if (node.displayName === TYPE$7) {
            color = "#572A72";
            text = "Canvas";
        }
        if (node.displayName === TYPE$6) {
            color = "#572A72";
            text = "Image";
        }
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.fillRect(pos.x, pos.y, nodeWidth, nodeHeight);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.font = "10px Arial";
        ctx.fillText(text, pos.x + nodeWidth / 2, pos.y + nodeHeight / 2 + 2.5);
        ctx.fill();
    }

    return;
}

function createSigmaGraphDataFromRenderGraph(videoContext) {
    function idForNode(node) {
        if (videoContext._sourceNodes.indexOf(node) !== -1) {
            let id = "source " + node.displayName + " " + videoContext._sourceNodes.indexOf(node);
            return id;
        }
        let id =
            "processor " + node.displayName + " " + videoContext._processingNodes.indexOf(node);
        return id;
    }

    let graph = {
        nodes: [
            {
                id: idForNode(videoContext.destination),
                label: "Destination Node",
                x: 2.5,
                y: 0.5,
                size: 2,
                node: videoContext.destination
            }
        ],
        edges: []
    };

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        let sourceNode = videoContext._sourceNodes[i];
        let y = i * (1.0 / videoContext._sourceNodes.length);
        graph.nodes.push({
            id: idForNode(sourceNode),
            label: "Source " + i.toString(),
            x: 0,
            y: y,
            size: 2,
            color: "#572A72",
            node: sourceNode
        });
    }
    for (let i = 0; i < videoContext._processingNodes.length; i++) {
        let processingNode = videoContext._processingNodes[i];
        graph.nodes.push({
            id: idForNode(processingNode),
            x: Math.random() * 2.5,
            y: Math.random(),
            size: 2,
            node: processingNode
        });
    }

    for (let i = 0; i < videoContext._renderGraph.connections.length; i++) {
        let conn = videoContext._renderGraph.connections[i];
        graph.edges.push({
            id: "e" + i.toString(),
            source: idForNode(conn.source),
            target: idForNode(conn.destination)
        });
    }

    return graph;
}

function importSimpleEDL(ctx, playlist) {
    // Create a "track" node to connect all the clips to.
    let trackNode = ctx.compositor(DEFINITIONS.COMBINE);

    // Create a source node for each of the clips.
    for (let clip of playlist) {
        let node;
        if (clip.type === "video") {
            node = ctx.video(clip.src, clip.sourceStart);
        } else if (clip.type === "image") {
            node = ctx.image(clip.src, clip.sourceStart);
        } else {
            console.debug(`Clip type ${clip.type} not recognised, skipping.`);
            continue;
        }
        node.startAt(clip.start);
        node.stopAt(clip.start + clip.duration);
        node.connect(trackNode);
    }
    return trackNode;
}

function visualiseVideoContextTimeline(videoContext, canvas, currentTime) {
    let ctx = canvas.getContext("2d");
    let w = canvas.width;
    let h = canvas.height;
    let trackHeight = h / videoContext._sourceNodes.length;
    let playlistDuration = videoContext.duration;

    if (currentTime > playlistDuration && !videoContext.endOnLastSourceEnd)
        playlistDuration = currentTime;

    if (videoContext.duration === Infinity) {
        let total = 0;
        for (let i = 0; i < videoContext._sourceNodes.length; i++) {
            let sourceNode = videoContext._sourceNodes[i];
            if (sourceNode._stopTime !== Infinity) total += sourceNode._stopTime;
        }

        if (total > videoContext.currentTime) {
            playlistDuration = total + 5;
        } else {
            playlistDuration = videoContext.currentTime + 5;
        }
    }
    let pixelsPerSecond = w / playlistDuration;
    let mediaSourceStyle = {
        video: ["#572A72", "#3C1255"],
        image: ["#7D9F35", "#577714"],
        canvas: ["#AA9639", "#806D15"]
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#999";

    for (let node of videoContext._processingNodes) {
        if (node.displayName !== TYPE$2) continue;
        for (let propertyName in node._transitions) {
            for (let transition of node._transitions[propertyName]) {
                let tW = (transition.end - transition.start) * pixelsPerSecond;
                let tH = h;
                let tX = transition.start * pixelsPerSecond;
                let tY = 0;
                ctx.fillStyle = "rgba(0,0,0, 0.3)";
                ctx.fillRect(tX, tY, tW, tH);
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < videoContext._sourceNodes.length; i++) {
        let sourceNode = videoContext._sourceNodes[i];
        let duration = sourceNode._stopTime - sourceNode._startTime;
        if (duration === Infinity) duration = videoContext.currentTime;
        let start = sourceNode._startTime;

        let msW = duration * pixelsPerSecond;
        let msH = trackHeight;
        let msX = start * pixelsPerSecond;
        let msY = trackHeight * i;
        ctx.fillStyle = mediaSourceStyle.video[i % mediaSourceStyle.video.length];

        ctx.fillRect(msX, msY, msW, msH);
        ctx.fill();
    }

    if (currentTime !== undefined) {
        ctx.fillStyle = "#000";
        ctx.fillRect(currentTime * pixelsPerSecond, 0, 1, h);
    }
}

class UpdateablesManager {
    constructor() {
        this._updateables = [];
        this._useWebworker = false;
        this._active = false;
        this._previousRAFTime = undefined;
        this._previousWorkerTime = undefined;

        this._webWorkerString =
            "\
            var running = false;\
            function tick(){\
                postMessage(Date.now());\
                if (running){\
                    setTimeout(tick, 1000/20);\
                }\
            }\
            self.addEventListener('message',function(msg){\
                var data = msg.data;\
                if (data === 'start'){\
                    running = true;\
                    tick();\
                }\
                if (data === 'stop') running = false;\
            });";
        this._webWorker = undefined;
    }

    _initWebWorker() {
        window.URL = window.URL || window.webkitURL;
        let blob = new Blob([this._webWorkerString], {
            type: "application/javascript"
        });
        this._webWorker = new Worker(URL.createObjectURL(blob));
        this._webWorker.onmessage = msg => {
            let time = msg.data;
            this._updateWorkerTime(time);
        };
    }

    _lostVisibility() {
        this._previousWorkerTime = Date.now();
        this._useWebworker = true;
        if (!this._webWorker) {
            this._initWebWorker();
        }
        this._webWorker.postMessage("start");
    }

    _gainedVisibility() {
        this._useWebworker = false;
        this._previousRAFTime = undefined;
        if (this._webWorker) this._webWorker.postMessage("stop");
        requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _init() {
        if (!window.Worker) return;

        //If page visibility API not present fallback to using "focus" and "blur" event listeners.
        if (typeof document.hidden === "undefined") {
            window.addEventListener("focus", this._gainedVisibility.bind(this));
            window.addEventListener("blur", this._lostVisibility.bind(this));
            return;
        }
        //Otherwise we can use the visibility API to do the loose/gain focus properly
        document.addEventListener(
            "visibilitychange",
            () => {
                if (document.hidden === true) {
                    this._lostVisibility();
                } else {
                    this._gainedVisibility();
                }
            },
            false
        );

        requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _updateWorkerTime(time) {
        let dt = (time - this._previousWorkerTime) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousWorkerTime = time;
    }

    _updateRAFTime(time) {
        if (this._previousRAFTime === undefined) this._previousRAFTime = time;
        let dt = (time - this._previousRAFTime) / 1000;
        if (dt !== 0) this._update(dt);
        this._previousRAFTime = time;
        if (!this._useWebworker) requestAnimationFrame(this._updateRAFTime.bind(this));
    }

    _update(dt) {
        for (let i = 0; i < this._updateables.length; i++) {
            this._updateables[i]._update(parseFloat(dt));
        }
    }

    register(updateable) {
        this._updateables.push(updateable);
        if (this._active === false) {
            this._active = true;
            this._init();
        }
    }
}

function mediaElementHasSource({ src, srcObject }) {
    return !((src === "" || src === undefined) && srcObject == null);
}

//Matthew Shotton, R&D User Experience,© BBC 2015

const TYPE = "AudioNode";
class AudioNode extends MediaNode {
    /**
     * Initialise an instance of an AudioNode.
     * This should not be called directly, but created through a call to videoContext.audio();
     */
    constructor() {
        super(...arguments);
        this._displayName = TYPE;
        this._elementType = "audio";
    }

    _update(currentTime) {
        super._update(currentTime, false);
    }
}

const NODES = {
    AudioNode,
    CanvasNode,
    ImageNode,
    MediaNode,
    SourceNode,
    VideoNode
};

//Matthew Shotton, R&D User Experience,© BBC 2015

class RenderGraph {
    /**
     * Manages the rendering graph.
     */
    constructor() {
        this.connections = [];
    }

    /**
     * Get a list of nodes which are connected to the output of the passed node.
     *
     * @param {GraphNode} node - the node to get the outputs for.
     * @return {GraphNode[]} An array of the nodes which are connected to the output.
     */
    getOutputsForNode(node) {
        let results = [];
        this.connections.forEach(function(connection) {
            if (connection.source === node) {
                results.push(connection.destination);
            }
        });
        return results;
    }

    /**
     * Get a list of nodes which are connected, by input name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"name", "name":inputName, "destination":destinationNode}.
     *
     * @param {GraphNode} node - the node to get the named inputs for.
     * @return {Object[]} An array of objects representing the nodes and connection type, which are connected to the named inputs for the node.
     */
    getNamedInputsForNode(node) {
        let results = [];
        this.connections.forEach(function(connection) {
            if (connection.destination === node && connection.type === "name") {
                results.push(connection);
            }
        });
        return results;
    }

    /**
     * Get a list of nodes which are connected, by z-index name, to the given node. Array contains objects of the form: {"source":sourceNode, "type":"zIndex", "zIndex":0, "destination":destinationNode}.
     *
     * @param {GraphNode} node - the node to get the z-index refernced inputs for.
     * @return {Object[]} An array of objects representing the nodes and connection type, which are connected by z-Index for the node.
     */
    getZIndexInputsForNode(node) {
        let results = [];
        this.connections.forEach(function(connection) {
            if (connection.destination === node && connection.type === "zIndex") {
                results.push(connection);
            }
        });
        results.sort(function(a, b) {
            return a.zIndex - b.zIndex;
        });
        return results;
    }

    /**
     * Get a list of nodes which are connected as inputs to the given node. The length of the return array is always equal to the number of inputs for the node, with undefined taking the place of any inputs not connected.
     *
     * @param {GraphNode} node - the node to get the inputs for.
     * @return {GraphNode[]} An array of GraphNodes which are connected to the node.
     */
    getInputsForNode(node) {
        let inputNames = node.inputNames;
        let results = [];
        let namedInputs = this.getNamedInputsForNode(node);
        let indexedInputs = this.getZIndexInputsForNode(node);

        if (node._limitConnections === true) {
            for (let i = 0; i < inputNames.length; i++) {
                results[i] = undefined;
            }

            for (let connection of namedInputs) {
                let index = inputNames.indexOf(connection.name);
                results[index] = connection.source;
            }
            let indexedInputsIndex = 0;
            for (let i = 0; i < results.length; i++) {
                if (results[i] === undefined && indexedInputs[indexedInputsIndex] !== undefined) {
                    results[i] = indexedInputs[indexedInputsIndex].source;
                    indexedInputsIndex += 1;
                }
            }
        } else {
            for (let connection of namedInputs) {
                results.push(connection.source);
            }
            for (let connection of indexedInputs) {
                results.push(connection.source);
            }
        }
        return results;
    }

    /**
     * Check if a named input on a node is available to connect too.
     * @param {GraphNode} node - the node to check.
     * @param {String} inputName - the named input to check.
     */
    isInputAvailable(node, inputName) {
        if (node._inputNames.indexOf(inputName) === -1) return false;
        for (let connection of this.connections) {
            if (connection.type === "name") {
                if (connection.destination === node && connection.name === inputName) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Register a connection between two nodes.
     *
     * @param {GraphNode} sourceNode - the node to connect from.
     * @param {GraphNode} destinationNode - the node to connect to.
     * @param {(String | number)} [target] - the target port of the conenction, this could be a string to specfiy a specific named port, a number to specify a port by index, or undefined, in which case the next available port will be connected to.
     * @return {boolean} Will return true if connection succeeds otherwise will throw a ConnectException.
     */
    registerConnection(sourceNode, destinationNode, target) {
        if (
            destinationNode.inputs.length >= destinationNode.inputNames.length &&
            destinationNode._limitConnections === true
        ) {
            throw new ConnectException("Node has reached max number of inputs, can't connect");
        }

        if (destinationNode._limitConnections === false) {
            //check if connection is already made, if so raise a warning
            const inputs = this.getInputsForNode(destinationNode);
            if (inputs.includes(sourceNode)) {
                console.debug(
                    "WARNING - node connected mutliple times, removing previous connection"
                );
                this.unregisterConnection(sourceNode, destinationNode);
            }
        }

        if (typeof target === "number") {
            //target is a specific
            this.connections.push({
                source: sourceNode,
                type: "zIndex",
                zIndex: target,
                destination: destinationNode
            });
        } else if (typeof target === "string" && destinationNode._limitConnections) {
            //target is a named port

            //make sure named port is free
            if (this.isInputAvailable(destinationNode, target)) {
                this.connections.push({
                    source: sourceNode,
                    type: "name",
                    name: target,
                    destination: destinationNode
                });
            } else {
                throw new ConnectException("Port " + target + " is already connected to");
            }
        } else {
            //target is undefined so just make it a high zIndex
            let indexedConns = this.getZIndexInputsForNode(destinationNode);
            let index = 0;
            if (indexedConns.length > 0) index = indexedConns[indexedConns.length - 1].zIndex + 1;
            this.connections.push({
                source: sourceNode,
                type: "zIndex",
                zIndex: index,
                destination: destinationNode
            });
        }
        return true;
    }

    /**
     * Remove a connection between two nodes.
     * @param {GraphNode} sourceNode - the node to unregsiter connection from.
     * @param {GraphNode} destinationNode - the node to register connection to.
     * @return {boolean} Will return true if removing connection succeeds, or false if there was no connectionsction to remove.
     */
    unregisterConnection(sourceNode, destinationNode) {
        let toRemove = [];

        this.connections.forEach(function(connection) {
            if (connection.source === sourceNode && connection.destination === destinationNode) {
                toRemove.push(connection);
            }
        });

        if (toRemove.length === 0) return false;

        toRemove.forEach(removeNode => {
            let index = this.connections.indexOf(removeNode);
            this.connections.splice(index, 1);
        });

        return true;
    }

    static outputEdgesFor(node, connections) {
        let results = [];
        for (let conn of connections) {
            if (conn.source === node) {
                results.push(conn);
            }
        }
        return results;
    }

    static inputEdgesFor(node, connections) {
        let results = [];
        for (let conn of connections) {
            if (conn.destination === node) {
                results.push(conn);
            }
        }
        return results;
    }

    static getInputlessNodes(connections) {
        let inputLess = [];
        for (let conn of connections) {
            inputLess.push(conn.source);
        }
        for (let conn of connections) {
            let index = inputLess.indexOf(conn.destination);
            if (index !== -1) {
                inputLess.splice(index, 1);
            }
        }
        return inputLess;
    }
}

/**
 * A video element item created and managed by the `VideoElementCache`.
 *
 * This creates and stores a `<video />` element, which is assigned
 * to a `MediaNode` by the `VideoElementCache` for playback. Once
 * playback has completed the `MediaNode` association will be removed
 * and potentially replaced with another.
 */
class VideoElementCacheItem {
    constructor(node = null) {
        this._element = this._createElement();
        this._node = node;
    }

    _createElement() {
        let videoElement = document.createElement("video");
        videoElement.setAttribute("crossorigin", "anonymous");
        videoElement.setAttribute("webkit-playsinline", "");
        videoElement.setAttribute("playsinline", "");
        // This seems necessary to allow using video as a texture. See:
        // https://bugs.chromium.org/p/chromium/issues/detail?id=898550
        // https://github.com/pixijs/pixi.js/issues/5996
        videoElement.preload = "auto";
        return videoElement;
    }

    get element() {
        return this._element;
    }

    set element(element) {
        this._element = element;
    }

    linkNode(node) {
        this._node = node;
    }

    unlinkNode() {
        this._node = null;
    }

    isPlaying() {
        return this._node && this._node._state === STATE$1.playing;
    }
}

class VideoElementCache {
    constructor(cache_size = 3) {
        this._cacheItems = [];
        this._cacheItemsInitialised = false;
        for (let i = 0; i < cache_size; i++) {
            // Create a video element and cache
            this._cacheItems.push(new VideoElementCacheItem());
        }
    }

    init() {
        if (!this._cacheItemsInitialised) {
            for (let cacheItem of this._cacheItems) {
                try {
                    cacheItem.element.play().then(
                        () => {
                            // Pause any elements not in the "playing" state
                            if (!cacheItem.isPlaying()) {
                                cacheItem.element.pause();
                            }
                        },
                        e => {
                            if (e.name !== "NotSupportedError") throw e;
                        }
                    );
                } catch (e) {
                    //console.log(e.name);
                }
            }
        }
        this._cacheItemsInitialised = true;
    }

    /**
     * Find and return an empty initialised element or, if the cache is
     * empty, create a new one.
     *
     * @param {Object} mediaNode A `MediaNode` instance
     */
    getElementAndLinkToNode(mediaNode) {
        // Try and get an already intialised element.
        for (let cacheItem of this._cacheItems) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cacheItem.element)) {
                // attach node to the element
                cacheItem.linkNode(mediaNode);
                return cacheItem.element;
            }
        }
        // Fallback to creating a new element if none exist or are available
        console.debug(
            "No available video element in the cache, creating a new one. This may break mobile, make your initial cache larger."
        );
        let cacheItem = new VideoElementCacheItem(mediaNode);
        this._cacheItems.push(cacheItem);
        this._cacheItemsInitialised = false;
        return cacheItem.element;
    }

    /**
     * Unlink any media node currently linked to a cached video element.
     *
     * @param {VideoElement} element The element to unlink from any media nodes
     */
    unlinkNodeFromElement(element) {
        for (let cacheItem of this._cacheItems) {
            // Unlink the node from the element
            if (element === cacheItem._element) {
                cacheItem.unlinkNode();
            }
        }
    }

    get length() {
        return this._cacheItems.length;
    }

    get unused() {
        let count = 0;
        for (let cacheItem of this._cacheItems) {
            // For some reason an uninitialised videoElement has its sr attribute set to the windows href. Hence the below check.
            if (!mediaElementHasSource(cacheItem.element)) count += 1;
        }
        return count;
    }
}

//Matthew Shotton, R&D User Experience,© BBC 2015

let updateablesManager = new UpdateablesManager();

/**
 * VideoContext.
 * @module VideoContext
 */
class VideoContext {
    /**
     * Initialise the VideoContext and render to the specific canvas. A 2nd parameter can be passed to the constructor which is a function that get's called if the VideoContext fails to initialise.
     *
     * @param {Canvas} canvas - the canvas element to render the output to.
     * @param {function} [initErrorCallback] - a callback for if initialising the canvas failed.
     * @param {Object} [options] - a number of custom options which can be set on the VideoContext, generally best left as default.
     * @param {boolean} [options.manualUpdate=false] - Make Video Context not use the updatable manager
     * @param {boolean} [options.endOnLastSourceEnd=true] - Trigger an `ended` event when the current time goes above the duration of the composition
     * @param {boolean} [options.useVideoElementCache=true] - Creates a pool of video element that will be all initialised at the same time. Important for mobile support
     * @param {number} [options.videoElementCacheSize=6] - Number of video element in the pool
     * @param {object} [options.webglContextAttributes] - A set of attributes used when getting the GL context. Alpha will always be `true`.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement, () => console.error("Sorry, your browser dosen\'t support WebGL"));
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     *
     */
    constructor(
        canvas,
        initErrorCallback,
        {
            manualUpdate = false,
            endOnLastSourceEnd = true,
            useVideoElementCache = true,
            videoElementCacheSize = 6,
            webglContextAttributes = {}
        } = {}
    ) {
        this._canvas = canvas;
        this._endOnLastSourceEnd = endOnLastSourceEnd;

        this._gl = canvas.getContext(
            "experimental-webgl",
            Object.assign(
                { preserveDrawingBuffer: true }, // can be overriden
                webglContextAttributes,
                { alpha: false } // Can't be overriden because it is copied last
            )
        );
        if (this._gl === null) {
            console.error("Failed to intialise WebGL.");
            if (initErrorCallback) initErrorCallback();
            return;
        }

        // Initialise the video element cache
        this._useVideoElementCache = useVideoElementCache;
        if (this._useVideoElementCache) {
            this._videoElementCache = new VideoElementCache(videoElementCacheSize);
        }

        // Create a unique ID for this VideoContext which can be used in the debugger.
        if (this._canvas.id) {
            if (typeof this._canvas.id === "string" || this._canvas.id instanceof String) {
                this._id = canvas.id;
            }
        }
        if (this._id === undefined) this._id = generateRandomId();
        if (window.__VIDEOCONTEXT_REFS__ === undefined) window.__VIDEOCONTEXT_REFS__ = {};
        window.__VIDEOCONTEXT_REFS__[this._id] = this;

        this._renderGraph = new RenderGraph();
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;
        this._state = VideoContext.STATE.PAUSED;
        this._playbackRate = 1.0;
        this._volume = 1.0;
        this._sourcesPlaying = undefined;
        this._destinationNode = new DestinationNode(this._gl, this._renderGraph);

        this._callbacks = new Map();
        Object.keys(VideoContext.EVENTS).forEach(name =>
            this._callbacks.set(VideoContext.EVENTS[name], [])
        );

        this._timelineCallbacks = [];

        if (!manualUpdate) {
            updateablesManager.register(this);
        }
    }

    /**
     * Returns an ID assigned to the VideoContext instance. This will either be the same id as the underlying canvas element,
     * or a uniquely generated one.
     */
    get id() {
        return this._id;
    }

    /**
     * Set the ID of the VideoContext instance. This should be unique.
     */
    set id(newID) {
        delete window.__VIDEOCONTEXT_REFS__[this._id];
        if (window.__VIDEOCONTEXT_REFS__[newID] !== undefined)
            console.warn("Warning; setting id to that of an existing VideoContext instance.");
        window.__VIDEOCONTEXT_REFS__[newID] = this;
        this._id = newID;
    }

    /**
     * Register a callback to happen at a specific point in time.
     * @param {number} time - the time at which to trigger the callback.
     * @param {Function} func - the callback to register.
     * @param {number} ordering - the order in which to call the callback if more than one is registered for the same time.
     */
    registerTimelineCallback(time, func, ordering = 0) {
        this._timelineCallbacks.push({
            time: time,
            func: func,
            ordering: ordering
        });
    }

    /**
     * Unregister a callback which happens at a specific point in time.
     * @param {Function} func - the callback to unregister.
     */
    unregisterTimelineCallback(func) {
        let toRemove = [];
        for (let callback of this._timelineCallbacks) {
            if (callback.func === func) {
                toRemove.push(callback);
            }
        }
        for (let callback of toRemove) {
            let index = this._timelineCallbacks.indexOf(callback);
            this._timelineCallbacks.splice(index, 1);
        }
    }

    /**
     * Register a callback to listen to one of the events defined in `VideoContext.EVENTS`
     *
     * @param {String} type - the event to register against.
     * @param {Function} func - the callback to register.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * ctx.registerCallback(VideoContext.EVENTS.STALLED, () => console.log("Playback stalled"));
     * ctx.registerCallback(VideoContext.EVENTS.UPDATE, () => console.log("new frame"));
     * ctx.registerCallback(VideoContext.EVENTS.ENDED, () => console.log("Playback ended"));
     */
    registerCallback(type, func) {
        if (!this._callbacks.has(type)) return false;
        this._callbacks.get(type).push(func);
    }

    /**
     * Remove a previously registered callback
     *
     * @param {Function} func - the callback to remove.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //the callback
     * var updateCallback = () => console.log("new frame");
     *
     * //register the callback
     * ctx.registerCallback(VideoContext.EVENTS.UPDATE, updateCallback);
     * //then unregister it
     * ctx.unregisterCallback(updateCallback);
     *
     */
    unregisterCallback(func) {
        for (let funcArray of this._callbacks.values()) {
            let index = funcArray.indexOf(func);
            if (index !== -1) {
                funcArray.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    _callCallbacks(type) {
        let funcArray = this._callbacks.get(type);
        for (let func of funcArray) {
            func(this._currentTime);
        }
    }

    /**
     * Get the canvas that the VideoContext is using.
     *
     * @return {HTMLCanvasElement} The canvas that the VideoContext is using.
     *
     */
    get element() {
        return this._canvas;
    }

    /**
     * Get the current state.
     * @return {STATE} The number representing the state.
     *
     */
    get state() {
        return this._state;
    }

    /**
     * Set the progress through the internal timeline.
     * Setting this can be used as a way to implement a scrubbable timeline.
     *
     * @param {number} currentTime - this is the currentTime to set in seconds.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(20);
     * ctx.currentTime = 10; // seek 10 seconds in
     * ctx.play();
     *
     */
    set currentTime(currentTime) {
        if (currentTime < this.duration && this._state === VideoContext.STATE.ENDED)
            this._state = VideoContext.STATE.PAUSED;

        if (typeof currentTime === "string" || currentTime instanceof String) {
            currentTime = parseFloat(currentTime);
        }

        for (let i = 0; i < this._sourceNodes.length; i++) {
            this._sourceNodes[i]._seek(currentTime);
        }
        for (let i = 0; i < this._processingNodes.length; i++) {
            this._processingNodes[i]._seek(currentTime);
        }
        this._currentTime = currentTime;
    }

    /**
     * Get how far through the internal timeline has been played.
     *
     * Getting this value will give the current playhead position. Can be used for updating timelines.
     * @return {number} The time in seconds through the current playlist.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     * setTimeout(() => console.log(ctx.currentTime),1000); //should print roughly 1.0
     *
     */
    get currentTime() {
        return this._currentTime;
    }

    /**
     * Get the time at which the last node in the current internal timeline finishes playing.
     *
     * @return {number} The end time in seconds of the last video node to finish playing.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * console.log(ctx.duration); //prints 0
     *
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     *
     * console.log(ctx.duration); //prints 10
     *
     * ctx.play();
     */
    get duration() {
        let maxTime = 0;
        for (let i = 0; i < this._sourceNodes.length; i++) {
            if (
                this._sourceNodes[i].state !== STATE$1.waiting &&
                this._sourceNodes[i]._stopTime > maxTime
            ) {
                maxTime = this._sourceNodes[i]._stopTime;
            }
        }
        return maxTime;
    }

    /**
     * Get the final node in the render graph which represents the canvas to display content on to.
     *
     * This proprety is read-only and there can only ever be one destination node. Other nodes can connect to this but you cannot connect this node to anything.
     *
     * @return {DestinationNode} A graph node representing the canvas to display the content on.
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.start(0);
     * videoNode.stop(10);
     * videoNode.connect(ctx.destination);
     *
     */
    get destination() {
        return this._destinationNode;
    }

    /**
     * Set the playback rate of the VideoContext instance.
     * This will alter the playback speed of all media elements played through the VideoContext.
     *
     * @param {number} rate - this is the playback rate.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.start(0);
     * videoNode.stop(10);
     * videoNode.connect(ctx.destination);
     * ctx.playbackRate = 2;
     * ctx.play(); // Double playback rate means this will finish playing in 5 seconds.
     */
    set playbackRate(rate) {
        if (rate <= 0) {
            throw new RangeError("playbackRate must be greater than 0");
        }
        for (let node of this._sourceNodes) {
            if (node.constructor.name === TYPE$8) {
                node._globalPlaybackRate = rate;
                node._playbackRateUpdated = true;
            }
        }
        this._playbackRate = rate;
    }

    /**
     *  Return the current playbackRate of the video context.
     * @return {number} A value representing the playbackRate. 1.0 by default.
     */
    get playbackRate() {
        return this._playbackRate;
    }

    /**
     * Set the volume of all MediaNode created in the VideoContext.
     * @param {number} volume - the volume to apply to the video nodes.
     */
    set volume(vol) {
        for (let node of this._sourceNodes) {
            if (node instanceof VideoNode || node instanceof AudioNode) {
                node.volume = vol;
            }
        }
        this._volume = vol;
    }

    /**
     * Return the current volume of the video context.
     * @return {number} A value representing the volume. 1.0 by default.
     */
    get volume() {
        return this._volume;
    }

    /**
     * Start the VideoContext playing
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(10);
     * ctx.play();
     */
    play() {
        console.debug("VideoContext - playing");
        //Initialise the video element cache
        if (this._videoElementCache) this._videoElementCache.init();
        // set the state.
        this._state = VideoContext.STATE.PLAYING;
        return true;
    }

    /**
     * Pause playback of the VideoContext
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("video.mp4");
     * videoNode.connect(ctx.destination);
     * videoNode.start(0);
     * videoNode.stop(20);
     * ctx.currentTime = 10; // seek 10 seconds in
     * ctx.play();
     * setTimeout(() => ctx.pause(), 1000); //pause playback after roughly one second.
     */
    pause() {
        console.debug("VideoContext - pausing");
        this._state = VideoContext.STATE.PAUSED;
        return true;
    }

    /**
     * Create a new node representing a video source
     *
     * @param {string|HTMLVideoElement|MediaStream} - The URL or video element to create the video from.
     * @param {number} [sourceOffset=0] - Offset into the start of the source video to start playing from.
     * @param {number} [preloadTime=4] - How many seconds before the video is to be played to start loading it.
     * @param {Object} [videoElementAttributes] - A dictionary of attributes to map onto the underlying video element.
     * @return {VideoNode} A new video node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var videoNode = ctx.video("bigbuckbunny.mp4");
     */
    video(src, sourceOffset = 0, preloadTime = 4, videoElementAttributes = {}) {
        let videoNode = new VideoNode(
            src,
            this._gl,
            this._renderGraph,
            this._currentTime,
            this._playbackRate,
            sourceOffset,
            preloadTime,
            this._videoElementCache,
            videoElementAttributes
        );
        this._sourceNodes.push(videoNode);
        return videoNode;
    }

    /**
     * Create a new node representing an audio source
     * @param {string|HTMLAudioElement|MediaStream} src - The url or audio element to create the audio node from.
     * @param {number} [sourceOffset=0] - Offset into the start of the source audio to start playing from.
     * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
     * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
     * @return {AudioNode} A new audio node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var audioNode = ctx.audio("ziggystardust.mp3");
     */
    audio(src, sourceOffset = 0, preloadTime = 4, audioElementAttributes = {}) {
        let audioNode = new AudioNode(
            src,
            this._gl,
            this._renderGraph,
            this._currentTime,
            this._playbackRate,
            sourceOffset,
            preloadTime,
            this._audioElementCache,
            audioElementAttributes
        );
        this._sourceNodes.push(audioNode);
        return audioNode;
    }

    /**
     * @deprecated
     */
    createVideoSourceNode(src, sourceOffset = 0, preloadTime = 4, videoElementAttributes = {}) {
        this._deprecate(
            "Warning: createVideoSourceNode will be deprecated in v1.0, please switch to using VideoContext.video()"
        );
        return this.video(src, sourceOffset, preloadTime, videoElementAttributes);
    }

    /**
     * Create a new node representing an image source
     * @param {string|Image|ImageBitmap} src - The url or image element to create the image node from.
     * @param {number} [preloadTime=4] - How long before a node is to be displayed to attmept to load it.
     * @param {Object} [imageElementAttributes] - Any attributes to be given to the underlying image element.
     * @return {ImageNode} A new image node.
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     * var imageNode = ctx.image("image.png");
     *
     * @example
     * var canvasElement = document.getElementById("canvas");
     * var imageElement = document.getElementById("image");
     * var ctx = new VideoContext(canvasElement);
     * var imageNode = ctx.image(imageElement);
     */
    image(src, preloadTime = 4, imageElementAttributes = {}) {
        let imageNode = new ImageNode(
            src,
            this._gl,
            this._renderGraph,
            this._currentTime,
            preloadTime,
            imageElementAttributes
        );
        this._sourceNodes.push(imageNode);
        return imageNode;
    }

    /**
     * @deprecated
     */
    createImageSourceNode(src, sourceOffset = 0, preloadTime = 4, imageElementAttributes = {}) {
        this._deprecate(
            "Warning: createImageSourceNode will be deprecated in v1.0, please switch to using VideoContext.image()"
        );
        return this.image(src, sourceOffset, preloadTime, imageElementAttributes);
    }

    /**
     * Create a new node representing a canvas source
     * @param {Canvas} src - The canvas element to create the canvas node from.
     * @return {CanvasNode} A new canvas node.
     */
    canvas(canvas) {
        let canvasNode = new CanvasNode(canvas, this._gl, this._renderGraph, this._currentTime);
        this._sourceNodes.push(canvasNode);
        return canvasNode;
    }

    /**
     * @deprecated
     */
    createCanvasSourceNode(canvas, sourceOffset = 0, preloadTime = 4) {
        this._deprecate(
            "Warning: createCanvasSourceNode will be deprecated in v1.0, please switch to using VideoContext.canvas()"
        );
        return this.canvas(canvas, sourceOffset, preloadTime);
    }

    /**
     * Create a new effect node.
     * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS.
     * @return {EffectNode} A new effect node created from the passed definition
     */
    effect(definition) {
        let effectNode = new EffectNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(effectNode);
        return effectNode;
    }

    /**
     * @deprecated
     */
    createEffectNode(definition) {
        this._deprecate(
            "Warning: createEffectNode will be deprecated in v1.0, please switch to using VideoContext.effect()"
        );
        return this.effect(definition);
    }

    /**
     * Create a new compositiing node.
     *
     * Compositing nodes are used for operations such as combining multiple video sources into a single track/connection for further processing in the graph.
     *
     * A compositing node is slightly different to other processing nodes in that it only has one input in it's definition but can have unlimited connections made to it.
     * The shader in the definition is run for each input in turn, drawing them to the output buffer. This means there can be no interaction between the spearte inputs to a compositing node, as they are individually processed in seperate shader passes.
     *
     * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the compositing node to create. Builtin definitions can be found by accessing VideoContext.DEFINITIONS
     *
     * @return {CompositingNode} A new compositing node created from the passed definition.
     *
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //A simple compositing node definition which just renders all the inputs to the output buffer.
     * var combineDefinition = {
     *     vertexShader : "\
     *         attribute vec2 a_position;\
     *         attribute vec2 a_texCoord;\
     *         varying vec2 v_texCoord;\
     *         void main() {\
     *             gl_Position = vec4(vec2(2.0,2.0)*vec2(1.0, 1.0), 0.0, 1.0);\
     *             v_texCoord = a_texCoord;\
     *         }",
     *     fragmentShader : "\
     *         precision mediump float;\
     *         uniform sampler2D u_image;\
     *         uniform float a;\
     *         varying vec2 v_texCoord;\
     *         varying float v_progress;\
     *         void main(){\
     *             vec4 color = texture2D(u_image, v_texCoord);\
     *             gl_FragColor = color;\
     *         }",
     *     properties:{
     *         "a":{type:"uniform", value:0.0},
     *     },
     *     inputs:["u_image"]
     * };
     * //Create the node, passing in the definition.
     * var trackNode = videoCtx.compositor(combineDefinition);
     *
     * //create two videos which will play at back to back
     * var videoNode1 = ctx.video("video1.mp4");
     * videoNode1.play(0);
     * videoNode1.stop(10);
     * var videoNode2 = ctx.video("video2.mp4");
     * videoNode2.play(10);
     * videoNode2.stop(20);
     *
     * //Connect the nodes to the combine node. This will give a single connection representing the two videos which can
     * //be connected to other effects such as LUTs, chromakeyers, etc.
     * videoNode1.connect(trackNode);
     * videoNode2.connect(trackNode);
     *
     * //Don't do anything exciting, just connect it to the output.
     * trackNode.connect(ctx.destination);
     *
     */
    compositor(definition) {
        let compositingNode = new CompositingNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(compositingNode);
        return compositingNode;
    }

    /**
     * Instanciate a custom built source node
     * @param {SourceNode} CustomSourceNode
     * @param {Object} src
     * @param  {...any} options
     */
    customSourceNode(CustomSourceNode, src, ...options) {
        const customSourceNode = new CustomSourceNode(
            src,
            this._gl,
            this._renderGraph,
            this._currentTime,
            ...options
        );
        this._sourceNodes.push(customSourceNode);
        return customSourceNode;
    }

    /**
     * @depricated
     */
    createCompositingNode(definition) {
        this._deprecate(
            "Warning: createCompositingNode will be deprecated in v1.0, please switch to using VideoContext.compositor()"
        );
        return this.compositor(definition);
    }

    /**
     * Create a new transition node.
     *
     * Transistion nodes are a type of effect node which have parameters which can be changed as events on the timeline.
     *
     * For example a transition node which cross-fades between two videos could have a "mix" property which sets the
     * progress through the transistion. Rather than having to write your own code to adjust this property at specfic
     * points in time a transition node has a "transition" function which takes a startTime, stopTime, targetValue, and a
     * propertyName (which will be "mix"). This will linearly interpolate the property from the curernt value to
     * tragetValue between the startTime and stopTime.
     *
     * @param {Object} definition - this is an object defining the shaders, inputs, and properties of the transition node to create.
     * @return {TransitionNode} A new transition node created from the passed definition.
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement);
     *
     * //A simple cross-fade node definition which cross-fades between two videos based on the mix property.
     * var crossfadeDefinition = {
     *     vertexShader : "\
     *        attribute vec2 a_position;\
     *        attribute vec2 a_texCoord;\
     *        varying vec2 v_texCoord;\
     *        void main() {\
     *            gl_Position = vec4(vec2(2.0,2.0)*a_position-vec2(1.0, 1.0), 0.0, 1.0);\
     *            v_texCoord = a_texCoord;\
     *         }",
     *     fragmentShader : "\
     *         precision mediump float;\
     *         uniform sampler2D u_image_a;\
     *         uniform sampler2D u_image_b;\
     *         uniform float mix;\
     *         varying vec2 v_texCoord;\
     *         varying float v_mix;\
     *         void main(){\
     *             vec4 color_a = texture2D(u_image_a, v_texCoord);\
     *             vec4 color_b = texture2D(u_image_b, v_texCoord);\
     *             color_a[0] *= mix;\
     *             color_a[1] *= mix;\
     *             color_a[2] *= mix;\
     *             color_a[3] *= mix;\
     *             color_b[0] *= (1.0 - mix);\
     *             color_b[1] *= (1.0 - mix);\
     *             color_b[2] *= (1.0 - mix);\
     *             color_b[3] *= (1.0 - mix);\
     *             gl_FragColor = color_a + color_b;\
     *         }",
     *     properties:{
     *         "mix":{type:"uniform", value:0.0},
     *     },
     *     inputs:["u_image_a","u_image_b"]
     * };
     *
     * //Create the node, passing in the definition.
     * var transitionNode = videoCtx.transition(crossfadeDefinition);
     *
     * //create two videos which will overlap by two seconds
     * var videoNode1 = ctx.video("video1.mp4");
     * videoNode1.play(0);
     * videoNode1.stop(10);
     * var videoNode2 = ctx.video("video2.mp4");
     * videoNode2.play(8);
     * videoNode2.stop(18);
     *
     * //Connect the nodes to the transistion node.
     * videoNode1.connect(transitionNode);
     * videoNode2.connect(transitionNode);
     *
     * //Set-up a transition which happens at the crossover point of the playback of the two videos
     * transitionNode.transition(8,10,1.0,"mix");
     *
     * //Connect the transition node to the output
     * transitionNode.connect(ctx.destination);
     *
     * //start playback
     * ctx.play();
     */
    transition(definition) {
        let transitionNode = new TransitionNode(this._gl, this._renderGraph, definition);
        this._processingNodes.push(transitionNode);
        return transitionNode;
    }

    /**
     * @deprecated
     */
    createTransitionNode(definition) {
        this._deprecate(
            "Warning: createTransitionNode will be deprecated in v1.0, please switch to using VideoContext.transition()"
        );
        return this.transition(definition);
    }

    _isStalled() {
        for (let i = 0; i < this._sourceNodes.length; i++) {
            let sourceNode = this._sourceNodes[i];
            if (!sourceNode._isReady()) {
                return true;
            }
        }
        return false;
    }

    /**
     * This allows manual calling of the update loop of the videoContext.
     *
     * @param {Number} dt - The difference in seconds between this and the previous calling of update.
     * @example
     *
     * var canvasElement = document.getElementById("canvas");
     * var ctx = new VideoContext(canvasElement, undefined, {"manualUpdate" : true});
     *
     * var previousTime;
     * function update(time){
     *     if (previousTime === undefined) previousTime = time;
     *     var dt = (time - previousTime)/1000;
     *     ctx.update(dt);
     *     previousTime = time;
     *     requestAnimationFrame(update);
     * }
     * update();
     *
     */
    update(dt) {
        this._update(dt);
    }

    _update(dt) {
        //Remove any destroyed nodes
        this._sourceNodes = this._sourceNodes.filter(sourceNode => {
            if (!sourceNode.destroyed) return sourceNode;
        });

        this._processingNodes = this._processingNodes.filter(processingNode => {
            if (!processingNode.destroyed) return processingNode;
        });

        if (
            this._state === VideoContext.STATE.PLAYING ||
            this._state === VideoContext.STATE.STALLED ||
            this._state === VideoContext.STATE.PAUSED
        ) {
            this._callCallbacks(VideoContext.EVENTS.UPDATE);

            if (this._state !== VideoContext.STATE.PAUSED) {
                if (this._isStalled()) {
                    this._callCallbacks(VideoContext.EVENTS.STALLED);
                    this._state = VideoContext.STATE.STALLED;
                } else {
                    this._state = VideoContext.STATE.PLAYING;
                }
            }

            if (this._state === VideoContext.STATE.PLAYING) {
                //Handle timeline callbacks.
                let activeCallbacks = new Map();
                for (let callback of this._timelineCallbacks) {
                    if (
                        callback.time >= this.currentTime &&
                        callback.time < this._currentTime + dt * this._playbackRate
                    ) {
                        //group the callbacks by time
                        if (!activeCallbacks.has(callback.time))
                            activeCallbacks.set(callback.time, []);
                        activeCallbacks.get(callback.time).push(callback);
                    }
                }

                //Sort the groups of callbacks by the times of the groups
                let timeIntervals = Array.from(activeCallbacks.keys());
                timeIntervals.sort(function(a, b) {
                    return a - b;
                });

                for (let t of timeIntervals) {
                    let callbacks = activeCallbacks.get(t);
                    callbacks.sort(function(a, b) {
                        return a.ordering - b.ordering;
                    });
                    for (let callback of callbacks) {
                        callback.func();
                    }
                }

                this._currentTime += dt * this._playbackRate;
                if (this._currentTime > this.duration && this._endOnLastSourceEnd) {
                    //Do an update od the sourcenodes in case anything in the "ended" callbacks modifes currentTime and sources haven't had a chance to stop.
                    for (let i = 0; i < this._sourceNodes.length; i++) {
                        this._sourceNodes[i]._update(this._currentTime);
                    }
                    this._state = VideoContext.STATE.ENDED;
                    this._callCallbacks(VideoContext.EVENTS.ENDED);
                }
            }

            let sourcesPlaying = false;

            for (let i = 0; i < this._sourceNodes.length; i++) {
                let sourceNode = this._sourceNodes[i];

                if (this._state === VideoContext.STATE.STALLED) {
                    if (sourceNode._isReady() && sourceNode._state === STATE$1.playing)
                        sourceNode._pause();
                }
                if (this._state === VideoContext.STATE.PAUSED) {
                    sourceNode._pause();
                }
                if (this._state === VideoContext.STATE.PLAYING) {
                    sourceNode._play();
                }
                sourceNode._update(this._currentTime);
                if (
                    sourceNode._state === STATE$1.paused ||
                    sourceNode._state === STATE$1.playing
                ) {
                    sourcesPlaying = true;
                }
            }

            if (
                sourcesPlaying !== this._sourcesPlaying &&
                this._state === VideoContext.STATE.PLAYING
            ) {
                if (sourcesPlaying === true) {
                    this._callCallbacks(VideoContext.EVENTS.CONTENT);
                } else {
                    this._callCallbacks(VideoContext.EVENTS.NOCONTENT);
                }
                this._sourcesPlaying = sourcesPlaying;
            }

            /*
             * Itterate the directed acyclic graph using Khan's algorithm (KHAAAAAN!).
             *
             * This has highlighted a bunch of ineffencies in the rendergraph class about how its stores connections.
             * Mainly the fact that to get inputs for a node you have to iterate the full list of connections rather than
             * a node owning it's connections.
             * The trade off with changing this is making/removing connections becomes more costly performance wise, but
             * this is definitely worth while because getting the connnections is a much more common operation.
             *
             * TL;DR Future matt - refactor this.
             *
             */
            let sortedNodes = [];
            let connections = this._renderGraph.connections.slice();
            let nodes = RenderGraph.getInputlessNodes(connections);

            while (nodes.length > 0) {
                let node = nodes.pop();
                sortedNodes.push(node);
                for (let edge of RenderGraph.outputEdgesFor(node, connections)) {
                    let index = connections.indexOf(edge);
                    if (index > -1) connections.splice(index, 1);
                    if (RenderGraph.inputEdgesFor(edge.destination, connections).length === 0) {
                        nodes.push(edge.destination);
                    }
                }
            }

            for (let node of sortedNodes) {
                if (this._sourceNodes.indexOf(node) === -1) {
                    node._update(this._currentTime);
                    node._render();
                }
            }
        }
    }

    /**
     * Destroy all nodes in the graph and reset the timeline. After calling this any created nodes will be unusable.
     */
    reset() {
        for (let callback of this._callbacks) {
            this.unregisterCallback(callback);
        }
        for (let node of this._sourceNodes) {
            node.destroy();
        }
        for (let node of this._processingNodes) {
            node.destroy();
        }
        this._update(0);
        this._sourceNodes = [];
        this._processingNodes = [];
        this._timeline = [];
        this._currentTime = 0;
        this._state = VideoContext.STATE.PAUSED;
        this._playbackRate = 1.0;
        this._sourcesPlaying = undefined;
        Object.keys(VideoContext.EVENTS).forEach(name =>
            this._callbacks.set(VideoContext.EVENTS[name], [])
        );
        this._timelineCallbacks = [];
    }

    _deprecate(msg) {
        console.log(msg);
    }

    static get DEFINITIONS() {
        return DEFINITIONS;
    }

    static get NODES() {
        return NODES;
    }

    /**
     * Get a JS Object containing the state of the VideoContext instance and all the created nodes.
     */
    snapshot() {
        return snapshot(this);
    }
}

/**
 * Video Context States
 * @readonly
 * @typedef {Object} STATE
 * @property {number} STATE.PLAYING - All sources are active
 * @property {number} STATE.PAUSED - All sources are paused
 * @property {number} STATE.STALLED - One or more sources is unable to play
 * @property {number} STATE.ENDED - All sources have finished playing
 * @property {number} STATE.BROKEN - The render graph is in a broken state
 */
const STATE = Object.freeze({
    PLAYING: 0,
    PAUSED: 1,
    STALLED: 2,
    ENDED: 3,
    BROKEN: 4
});
VideoContext.STATE = STATE;

/**
 * Video Context Events
 * @readonly
 * @typedef {Object} STATE
 * @property {string} STATE.UPDATE - Called any time a frame is rendered to the screen.
 * @property {string} STATE.STALLED - happens anytime the playback is stopped due to buffer starvation for playing assets.
 * @property {string} STATE.ENDED - Called once plackback has finished (i.e ctx.currentTime == ctx.duration).
 * @property {string} STATE.CONTENT - Called at the start of a time region where there is content playing out of one or more sourceNodes.
 * @property {number} STATE.NOCONTENT - Called at the start of any time region where the VideoContext is still playing, but there are currently no active playing sources.
 */
const EVENTS = Object.freeze({
    UPDATE: "update",
    STALLED: "stalled",
    ENDED: "ended",
    CONTENT: "content",
    NOCONTENT: "nocontent"
});
VideoContext.EVENTS = EVENTS;

VideoContext.visualiseVideoContextTimeline = visualiseVideoContextTimeline;
VideoContext.visualiseVideoContextGraph = visualiseVideoContextGraph;
VideoContext.createControlFormForNode = createControlFormForNode;
VideoContext.createSigmaGraphDataFromRenderGraph = createSigmaGraphDataFromRenderGraph;
VideoContext.exportToJSON = exportToJSON;
VideoContext.updateablesManager = updateablesManager;
VideoContext.importSimpleEDL = importSimpleEDL;

export { VideoContext };
