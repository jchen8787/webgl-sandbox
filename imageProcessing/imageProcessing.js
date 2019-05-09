window.onload = main

function main() {
    const image = new Image()
    // image.src = './survey_corps_104.jpeg'
    image.src = './eren_bertholdt.jpeg'
    image.onload = function() {
        render(image)
    }
}

function render(image) {
    const canvas = document.querySelector('#webgl-canvas')
    const gl = canvas.getContext('webgl')

    const vsSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;

        uniform vec2 u_resolution;

        varying vec2 v_texCoord;

        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

            v_texCoord = a_texCoord;
        }
    `

    const fsSource = `
        precision mediump float;

        uniform sampler2D u_image;
        uniform vec2 u_textureSize;

        uniform float u_kernel[9];
        uniform float u_kernelWeight;

        varying vec2 v_texCoord;

        void main() {
            vec2 onePixel = vec2(1.0, 1.0) / u_textureSize;
            vec4 colorSum =
                texture2D(u_image, v_texCoord + onePixel * vec2(-1, -1)) * u_kernel[0] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 0, -1)) * u_kernel[1] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 1, -1)) * u_kernel[2] +
                texture2D(u_image, v_texCoord + onePixel * vec2(-1,  0)) * u_kernel[3] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 0,  0)) * u_kernel[4] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 1,  0)) * u_kernel[5] +
                texture2D(u_image, v_texCoord + onePixel * vec2(-1,  1)) * u_kernel[6] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 0,  1)) * u_kernel[7] +
                texture2D(u_image, v_texCoord + onePixel * vec2( 1,  1)) * u_kernel[8];

            gl_FragColor = vec4((colorSum / u_kernelWeight).rgb, 1.0);
        }
    `

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vsSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fsSource)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    setRectangle(gl, 0, 0, gl.canvas.width, gl.canvas.height)
    // setRectangle(
    //     gl,
    //     (gl.canvas.width - image.width) / 2,
    //     (gl.canvas.height - image.height) / 2,
    //     image.width,
    //     image.height,
    // )

    const texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0.0,
            0.0,
            1.0,
            0.0,
            0.0,
            1.0,
            1.0,
            1.0,
            0.0,
            1.0,
            1.0,
            0.0,
        ]),
        gl.STATIC_DRAW,
    )

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(program)

    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(texCoordLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize')

    const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]')
    const kernelWeightLocation = gl.getUniformLocation(program, 'u_kernelWeight')

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(textureSizeLocation, image.width, image.height)

    const edgeDetectKernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1]

    gl.uniform1fv(kernelLocation, edgeDetectKernel)
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(edgeDetectKernel))

    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function setRectangle(gl, x, y, width, height) {
    const x1 = x
    const y1 = y

    const x2 = x + width
    const y2 = y + height

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([x1, y1, x2, y1, x1, y2, x2, y2, x1, y2, x2, y1]),
        gl.STATIC_DRAW,
    )
}

function computeKernelWeight(kernel) {
    const weight = kernel.reduce((acc, value) => acc + value, 0)
    return weight <= 0 ? 1 : weight
}
