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

    setGeometry(gl, buffers.position, 0, 0)
    const numVertices = 18

    // put position buffer data into program
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
    gl.enableVertexAttribArray(locations.position)
    gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0)

    gl.uniform2f(locations.resolution, gl.canvas.width, gl.canvas.height)

    // setup sliders
    const translation = [0, 0]
    const xSlider = document.querySelector('#x')
    // prettier-ignore
    xSlider.innerHTML = `
        <div>
            <span>x</span>
            <input
                type="range"
                min="0"
                max="${gl.canvas.width}"
                value="0" />
            <span id="xValue">${translation[0]}</span>
        </div>
    `

    xSlider.addEventListener('input', handleXChange)

    function handleXChange(e) {
        const value = parseInt(e.target.value)
        xSlider.querySelector('#xValue').textContent = value

        translation[0] = value
        drawScene(gl, buffers, locations, translation, numVertices)
    }

    const ySlider = document.querySelector('#y')
    // prettier-ignore
    ySlider.innerHTML = `
        <div>
            <span>y</span>
            <input
                type="range"
                min="0"
                max="${gl.canvas.height}"
                value="0" />
            <span id="yValue">${translation[1]}</span>
        </div>
    `

    ySlider.addEventListener('input', handleYChange)

    function handleYChange(e) {
        const value = parseInt(e.target.value)
        ySlider.querySelector('#yValue').textContent = value

        translation[1] = value
        drawScene(gl, buffers, locations, translation, numVertices)
    }

    drawScene(gl, buffers, locations, translation, numVertices)
}

function drawScene(gl, buffers, locations, translation, numVertices) {
    gl.uniform2fv(locations.translation, translation)

    // load color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)

    const vertexColors = []

    for (let i = 0; i < numVertices; i++) {
        vertexColors.push(Math.random())
        vertexColors.push(Math.random())
        vertexColors.push(Math.random())
        vertexColors.push(1)
    }

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertexColors),
        gl.STATIC_DRAW,
    )

    // put color buffer data into program
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color)
    gl.enableVertexAttribArray(locations.color)
    gl.vertexAttribPointer(locations.color, 4, gl.FLOAT, false, 0, 0)

    // render
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.drawArrays(gl.TRIANGLES, 0, numVertices)
}

function setGeometry(gl, positionBuffer, x, y) {
    const width = 200
    const height = 300
    const thickness = 50

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        // prettier-ignore
        new Float32Array([
            // left column
            x, y,
            x + thickness, y,
            x, y + height,
            x + thickness, y + height,
            x, y + height,
            x + thickness, y,

            // top rung
            x + thickness, y,
            x + thickness + width, y,
            x + thickness, y + thickness,
            x + thickness + width, y + thickness,
            x + thickness, y + thickness,
            x + thickness + width, y,

            // middle rung
            x + thickness, y + thickness * 2,
            x + width, y + thickness * 2,
            x + thickness, y + thickness * 3,
            x + width, y + thickness * 3,
            x + thickness, y + thickness * 3,
            x + width, y + thickness * 2,
        ]),
        gl.STATIC_DRAW,
    )
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}
