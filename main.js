window.onload = main

function main() {
    const canvas = document.querySelector('#webgl-canvas')
    const gl = canvas.getContext('webgl')

    const vsSource = `
        attribute vec2 a_position;

        uniform vec2 u_resolution;
        uniform vec2 u_offset;

        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1) + vec4(u_offset, 0, 0);
        }
    `

    const fsSource = `
        precision mediump float;

        uniform vec4 u_color;

        void main() {
            gl_FragColor = u_color;
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

    // render
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(0, 0, 0, 0)

    gl.useProgram(program)

    const resolutionUniformLocation = gl.getUniformLocation(
        program,
        'u_resolution',
    )
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height)

    const offsetUniformLocation = gl.getUniformLocation(
        program,
        'u_offset',
    )
    gl.uniform2fv(offsetUniformLocation, [0.25, -0.25])

    const positionAttributeLocation = gl.getAttribLocation(
        program,
        'a_position',
    )

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color')
    setInterval(() => drawScene(gl, colorUniformLocation), 1000)
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

function randomInt(range) {
    return Math.floor(Math.random() * range)
}
