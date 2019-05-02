main()

function main() {
    const canvas = document.querySelector('#webgl-canvas')
    const gl = canvas.getContext('webgl')

    const vsSource = `
        attribute vec2 a_position;

        uniform vec2 u_resolution;

        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        }
    `

    const fsSource = `
        precision mediump float;

        uniform vec4 u_color;

        void main() {
            gl_FragColor = u_color;
        }
    `

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    const program = createProgram(gl, vertexShader, fragmentShader)

    const positionAttributeLocation = gl.getAttribLocation(
        program,
        'a_position',
    )

    const resolutionUniformLocation = gl.getUniformLocation(
        program,
        'u_resolution',
    )
    const colorUniformLocation = gl.getUniformLocation(program, 'u_color')

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // render
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)

    gl.useProgram(program)
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

    setInterval(() => drawScene(gl, colorUniformLocation), 1000)
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    return shader
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    return program
}

function randomInt(range) {
    return Math.floor(Math.random() * range)
}

function drawScene(gl, colorUniformLocation) {
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let i = 0; i < 10; i++) {
        const x1 = randomInt(150)
        const y1 = randomInt(100)

        const width = randomInt(250)
        const height = randomInt(200)

        const x2 = x1 + width
        const y2 = y1 + height

        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
            gl.STATIC_DRAW,
        )

        gl.uniform4f(
            colorUniformLocation,
            Math.random(),
            Math.random(),
            Math.random(),
            1,
        )
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}
