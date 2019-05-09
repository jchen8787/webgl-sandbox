window.onload = main

function main() {
    const image = new Image()
    image.src = './survey_corps_104.jpeg'
    // image.src = './eren_bertholdt.jpeg'
    image.onload = function() {
        render(image)
    }
}

function render(image) {
    const canvas = document.querySelector('#webgl-canvas')
    const gl = canvas.getContext('webgl')

    const vertexShaderScript = document.getElementById('2d-vertex-shader')
    const vertexShaderSource = vertexShaderScript.text

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShaderScript = document.getElementById('2d-fragment-shader')
    const fragmentShaderSource = fragmentShaderScript.text

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, fragmentShaderSource)
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
    gl.useProgram(program)

    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(texCoordLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize')

    const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]')
    const kernelWeightLocation = gl.getUniformLocation(
        program,
        'u_kernelWeight',
    )

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(textureSizeLocation, image.width, image.height)

    const kernels = {
        normal: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        gaussianBlur: [
            0.045,
            0.122,
            0.045,
            0.122,
            0.332,
            0.122,
            0.045,
            0.122,
            0.045,
        ],
        gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
        gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],
        unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
        sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],
        edgeDetect: [
            -0.125,
            -0.125,
            -0.125,
            -0.125,
            1,
            -0.125,
            -0.125,
            -0.125,
            -0.125,
        ],
        edgeDetect2: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        edgeDetect3: [-5, 0, 0, 0, 0, 0, 0, 0, 5],
        edgeDetect4: [-1, -1, -1, 0, 0, 0, 1, 1, 1],
        edgeDetect5: [-1, -1, -1, 2, 2, 2, -1, -1, -1],
        edgeDetect6: [-5, -5, -5, -5, 39, -5, -5, -5, -5],
        sobelHorizontal: [1, 2, 1, 0, 0, 0, -1, -2, -1],
        sobelVertical: [1, 0, -1, 2, 0, -2, 1, 0, -1],
        previtHorizontal: [1, 1, 1, 0, 0, 0, -1, -1, -1],
        previtVertical: [1, 0, -1, 1, 0, -1, 1, 0, -1],
        boxBlur: [
            0.111,
            0.111,
            0.111,
            0.111,
            0.111,
            0.111,
            0.111,
            0.111,
            0.111,
        ],
        triangleBlur: [
            0.0625,
            0.125,
            0.0625,
            0.125,
            0.25,
            0.125,
            0.0625,
            0.125,
            0.0625,
        ],
        emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    }

    const initialSelection = 'edgeDetect'

    // kernel selection dropdown
    const ui = document.querySelector('#ui')
    const select = document.createElement('select')

    for (const kernel in kernels) {
        const option = document.createElement('option')
        option.value = kernel

        if (kernel === initialSelection) {
            option.selected = true
        }

        option.appendChild(document.createTextNode(kernel))
        select.appendChild(option)
    }

    select.onchange = function(e) {
        drawWithKernel(this.options[this.selectedIndex].value)
    }

    ui.appendChild(select)
    drawWithKernel(initialSelection)

    function drawWithKernel(kernel) {
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.enableVertexAttribArray(positionLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        gl.enableVertexAttribArray(texCoordLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

        gl.uniform1fv(kernelLocation, kernels[kernel])
        gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[kernel]))

        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
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
