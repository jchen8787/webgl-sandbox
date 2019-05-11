window.onload = main

function main() {
    // create webgl program
    const canvas = document.querySelector('canvas')
    const gl = canvas.getContext('webgl')

    const vertexShaderScript = document.getElementById('2d-vertex-shader')
    const fragmentShaderScript = document.getElementById('2d-fragment-shader')

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertexShader, vertexShaderScript.text)
    gl.shaderSource(fragmentShader, fragmentShaderScript.text)

    gl.compileShader(vertexShader)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // get glsl variable locations
    const locations = {
        position: gl.getAttribLocation(program, 'a_position'),
        color: gl.getAttribLocation(program, 'a_color'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        translation: gl.getUniformLocation(program, 'u_translation'),
    }

    // create buffers
    const buffers = {
        position: gl.createBuffer(),
        color: gl.createBuffer(),
    }

    gl.uniform2f(locations.resolution, gl.canvas.width, gl.canvas.height)

    // setup sliders
    const translation = [0, 0]
    const dimensions = [300, 200]

    const xSlider = document.querySelector('#x')
    // prettier-ignore
    xSlider.innerHTML = `
        <div>
            <span>x</span>
            <input
                type="range"
                min="0"
                max="${gl.canvas.width - dimensions[0]}"
                value="0" />
            <span id="xValue">${translation[0]}</span>
        </div>
    `

    xSlider.addEventListener('input', handleXChange)

    function handleXChange(e) {
        const value = parseInt(e.target.value)
        xSlider.querySelector('#xValue').textContent = value

        translation[0] = value
        drawScene(gl, locations, buffers, translation, dimensions)
    }

    const ySlider = document.querySelector('#y')
    // prettier-ignore
    ySlider.innerHTML = `
        <div>
            <span>y</span>
            <input
                type="range"
                min="0"
                max="${gl.canvas.height - dimensions[1]}"
                value="0" />
            <span id="yValue">${translation[1]}</span>
        </div>
    `

    ySlider.addEventListener('input', handleYChange)

    function handleYChange(e) {
        const value = parseInt(e.target.value)
        ySlider.querySelector('#yValue').textContent = value

        translation[1] = value
        drawScene(gl, locations, buffers, translation, dimensions)
    }

    drawScene(gl, locations, buffers, translation, dimensions)
}

function drawScene(gl, locations, buffers, translation, dimensions) {
    gl.uniform2fv(locations.translation, translation)

    const x0 = 0
    const x1 = dimensions[0]

    const y0 = 0
    const y1 = dimensions[1]

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        // prettier-ignore
        new Float32Array([
            x0, y0,
            x1, y0,
            x0, y1,
            x1, y1,
            x0, y1,
            x1, y0,
        ]),
        gl.STATIC_DRAW,
    )

    // load color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)

    const v0Color = [Math.random(), Math.random(), Math.random(), 1]
    const v1Color = [Math.random(), Math.random(), Math.random(), 1]
    const v2Color = [Math.random(), Math.random(), Math.random(), 1]
    const v3Color = [Math.random(), Math.random(), Math.random(), 1]
    const v4Color = [Math.random(), Math.random(), Math.random(), 1]
    const v5Color = [Math.random(), Math.random(), Math.random(), 1]
    gl.bufferData(
        gl.ARRAY_BUFFER,
        // prettier-ignore
        new Float32Array([
            v0Color[0], v0Color[1], v0Color[2], v0Color[3],
            v1Color[0], v1Color[1], v1Color[2], v1Color[3],
            v2Color[0], v2Color[1], v2Color[2], v2Color[3],
            v3Color[0], v3Color[1], v3Color[2], v3Color[3],
            v4Color[0], v4Color[1], v4Color[2], v4Color[3],
            v5Color[0], v5Color[1], v5Color[2], v5Color[3],
        ]),
        gl.STATIC_DRAW,
    )

    // put position buffer data into program
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.enableVertexAttribArray(locations.position)
    gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0)

    // put colorr buffer data into program
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.enableVertexAttribArray(locations.color)
    gl.vertexAttribPointer(locations.color, 4, gl.FLOAT, false, 0, 0)

    // render
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}
