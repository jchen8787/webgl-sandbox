window.onload = main

function main() {
    const canvas = document.querySelector('#webgl-canvas')
    const gl = canvas.getContext('webgl')

    const vsSource = `
        attribute vec2 a_position;
        attribute vec4 a_color;

        varying vec4 v_color;

        uniform vec2 u_resolution;
        uniform vec2 u_offset;

        void main() {
            vec2 zeroToOne = a_position / u_resolution;
            vec2 zeroToTwo = zeroToOne * 2.0;
            vec2 clipSpace = zeroToTwo - 1.0;

            gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1) + vec4(u_offset, 0, 0);

            v_color = a_color;
        }
    `

    const fsSource = `
        precision mediump float;

        varying vec4 v_color;

        void main() {
            gl_FragColor = v_color;
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

    // set uniform data
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)

    const offsetLocation = gl.getUniformLocation(program, 'u_offset')
    gl.uniform2fv(offsetLocation, [0.0, 0.0])

    // set up attribute buffers and locations
    const positionBuffer = gl.createBuffer()
    const colorBuffer = gl.createBuffer()

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const colorLocation = gl.getAttribLocation(program, 'a_color')

    setInterval(
        () =>
            drawScene(
                gl,
                positionBuffer,
                positionLocation,
                colorBuffer,
                colorLocation,
            ),
        1000,
    )
}

function drawScene(
    gl,
    positionBuffer,
    positionLocation,
    colorBuffer,
    colorLocation,
) {
    gl.clear(gl.COLOR_BUFFER_BIT)

    for (let i = 0; i < 10; i++) {
        // set position attribute data
        const x1 = randomInt(200)
        const y1 = randomInt(200)

        const width = randomInt(200)
        const height = randomInt(200)

        const x2 = x1 + width
        const y2 = y1 + height

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
            gl.STATIC_DRAW,
        )

        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

        // set color attribute data
        const v0Color = [Math.random(), Math.random(), Math.random(), 1]
        const v1Color = [Math.random(), Math.random(), Math.random(), 1]
        const v2Color = [Math.random(), Math.random(), Math.random(), 1]
        const v3Color = [Math.random(), Math.random(), Math.random(), 1]
        const v4Color = [Math.random(), Math.random(), Math.random(), 1]
        const v5Color = [Math.random(), Math.random(), Math.random(), 1]

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                v0Color[0],
                v0Color[1],
                v0Color[2],
                v0Color[3],
                v1Color[0],
                v1Color[1],
                v1Color[2],
                v1Color[3],
                v2Color[0],
                v2Color[1],
                v2Color[2],
                v2Color[3],
                v3Color[0],
                v3Color[1],
                v3Color[2],
                v3Color[3],
                v4Color[0],
                v4Color[1],
                v4Color[2],
                v4Color[3],
                v5Color[0],
                v5Color[1],
                v5Color[2],
                v5Color[3],
            ]),
            gl.STATIC_DRAW,
        )

        gl.enableVertexAttribArray(colorLocation)
        gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0)

        // draw!
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
}

function randomInt(range) {
    return Math.floor(Math.random() * range)
}
