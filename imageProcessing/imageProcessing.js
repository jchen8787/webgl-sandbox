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
    canvas.width = image.width
    canvas.height = image.height

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
    const texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    gl.bufferData(
        gl.ARRAY_BUFFER,
        // prettier-ignore
        new Float32Array([
            0, 0,
            image.width, 0,
            0, image.height,
            image.width, image.height,
            0, image.height,
            image.width, 0,
        ]),
        gl.STATIC_DRAW,
    )

    const texcoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        // prettier-ignore
        new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
        ]),
        gl.STATIC_DRAW,
    )

    function createAndSetupTexture(gl) {
        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        return texture
    }

    // setup textures
    const originalImageTexture = createAndSetupTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    // framebuffer textures
    const textures = []
    const framebuffers = []

    for (let i = 0; i < 2; i++) {
        const texture = createAndSetupTexture(gl)
        textures.push(texture)

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            image.width,
            image.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        )

        const fbo = gl.createFramebuffer()
        framebuffers.push(fbo)
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0,
        )
    }

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const textureSizeLocation = gl.getUniformLocation(program, 'u_textureSize')
    const kernelLocation = gl.getUniformLocation(program, 'u_kernel[0]')
    const kernelWeightLocation = gl.getUniformLocation(
        program,
        'u_kernelWeight',
    )
    const flipYLocation = gl.getUniformLocation(program, 'u_flipY')

    const kernels = {
        // prettier-ignore
        normal: [
            0, 0, 0,
            0, 1, 0,
            0, 0, 0,
        ],

        // prettier-ignore
        gaussianBlur: [
            0.045, 0.122, 0.045,
            0.122, 0.332, 0.122,
            0.045, 0.122, 0.045,
        ],
        gaussianBlur2: [1, 2, 1, 2, 4, 2, 1, 2, 1],
        gaussianBlur3: [0, 1, 0, 1, 1, 1, 0, 1, 0],

        unsharpen: [-1, -1, -1, -1, 9, -1, -1, -1, -1],
        sharpness: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        sharpen: [-1, -1, -1, -1, 16, -1, -1, -1, -1],

        // prettier-ignore
        edgeDetect: [
            -0.125, -0.125, -0.125,
            -0.125, 1,  -0.125,
            -0.125, -0.125, -0.125,
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

        // prettier-ignore
        boxBlur: [
            0.111, 0.111,  0.111,
            0.111, 0.111, 0.111,
            0.111, 0.111, 0.111,
        ],

        // prettier-ignore
        triangleBlur: [
            0.0625, 0.125, 0.0625,
            0.125, 0.25, 0.125,
            0.0625, 0.125, 0.0625,
        ],

        emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    }

    const effects = [
        { name: 'normal' },
        { name: 'gaussianBlur' },
        { name: 'gaussianBlur2' },
        { name: 'gaussianBlur3' },
        { name: 'unsharpen' },
        { name: 'sharpness' },
        { name: 'sharpen' },
        { name: 'edgeDetect' },
        { name: 'edgeDetect2' },
        { name: 'edgeDetect3' },
        { name: 'edgeDetect4' },
        { name: 'edgeDetect5' },
        { name: 'edgeDetect6' },
        { name: 'sobelHorizontal' },
        { name: 'sobelVertical' },
        { name: 'previtHorizontal' },
        { name: 'previtVertical' },
        { name: 'boxBlur' },
        { name: 'triangleBlur' },
        { name: 'emboss', on: true },
    ]

    // setup ui
    const ui = document.querySelector('#ui')
    const table = document.createElement('table')
    const tbody = document.createElement('tbody')

    for (let i = 0; i < effects.length; i++) {
        const effect = effects[i]
        const tr = document.createElement('tr')
        const td = document.createElement('td')

        const chk = document.createElement('input')
        chk.value = effect.name
        chk.type = 'checkbox'

        if (effect.on) {
            chk.checked = 'true'
        }

        chk.onchange = drawEffects
        td.appendChild(chk)
        td.appendChild(document.createTextNode('-> ' + effect.name))
        tr.appendChild(td)
        tbody.appendChild(tr)
    }

    table.appendChild(tbody)
    ui.appendChild(table)

    drawEffects()

    function computeKernelWeight(kernel) {
        const weight = kernel.reduce((acc, value) => acc + value, 0)
        return weight <= 0 ? 1 : weight
    }

    function drawEffects() {
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.useProgram(program)

        gl.enableVertexAttribArray(positionLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        gl.enableVertexAttribArray(texcoordLocation)
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
        gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

        gl.uniform2f(textureSizeLocation, image.width, image.height)
        gl.bindTexture(gl.TEXTURE_2D, originalImageTexture)

        gl.uniform1f(flipYLocation, 1)

        for (let i = 0; i < tbody.rows.length; i++) {
            const checkbox = tbody.rows[i].firstChild.firstChild
            if (checkbox.checked) {
                setFramebuffer(framebuffers[i % 2], image.width, image.height)
                drawWithKernel(checkbox.value)
                gl.bindTexture(gl.TEXTURE_2D, textures[i % 2])
            }
        }

        gl.uniform1f(flipYLocation, -1)
        setFramebuffer(null, gl.canvas.width, gl.canvas.height)
        drawWithKernel('normal')
    }

    function setFramebuffer(fbo, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.uniform2f(resolutionLocation, width, height)
        gl.viewport(0, 0, width, height)
    }

    function drawWithKernel(name) {
        gl.uniform1fv(kernelLocation, kernels[name])
        gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}
