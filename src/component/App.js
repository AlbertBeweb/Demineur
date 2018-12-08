import React from 'react'
import { connect } from 'react-redux'

import { Button } from '@blueprintjs/core'
import Playground from './Playground'

const RandInt = max => Math.floor(Math.random() * max)
const get = (x, y, playground) => playground[x] && playground[x][y]
const isDefined = v => v !== undefined
const getNeighbours = (x, y, playground) =>
    [
        get(y - 1, x - 1, playground),
        get(y - 1, x, playground),
        get(y - 1, x + 1, playground),
        get(y, x - 1, playground),
        get(y, x, playground),
        get(y, x + 1, playground),
        get(y + 1, x - 1, playground),
        get(y + 1, x, playground),
        get(y + 1, x + 1, playground),
    ].filter(isDefined)

// Nice to have: use int value to specify box status (ex: 0: hidden, 1: displayed, 2: flagged, 3: unknown)
const createPlayground = (width, height, bombs = 1) => {
    // Create playground.
    let playground = []
    for (let i = 0; i < height; i++) {
        playground[i] = []
        for (let j = 0; j < width; j++) {
            playground[i][j] = {
                x: j,
                y: i,
                key: i * width + j,
                val: 0,
                open: false,
                flag: '',
            }
        }
    }
    // Place bombs.
    let nbBombs = Math.max(1, Math.min(bombs, width * height - 1))
    let x = 0
    let y = 0
    while (nbBombs > 0) {
        x = RandInt(width)
        y = RandInt(height)
        if (playground[y][x].val === 0) {
            playground[y][x].val = -1
            nbBombs--
        }
    }
    // Set box value based on bombs proximity
    playground.map(row =>
        row.map(box => {
            if (box.val === 0) {
                const neighbours = getNeighbours(box.x, box.y, playground)
                neighbours.map(neighbour => {
                    if (neighbour.val === -1) {
                        box.val++
                    }
                })
            }
        }),
    )
    return playground
}

class App extends React.Component {
    state = {
        playground: [],
        mode: 'ONE',
        gameOver: false,
    }
    render() {
        return (
            <div>
                <div>
                    <Button
                        intent="success"
                        text="Check case"
                        onClick={() =>
                            this.props.changeModeActionCreator('ONE')
                        }
                    />
                    <Button
                        intent="success"
                        text="Mark bomb"
                        onClick={() =>
                            this.props.changeModeActionCreator('BOMB')
                        }
                    />
                    <Button
                        intent="success"
                        text="Mark suspicious"
                        onClick={() =>
                            this.props.changeModeActionCreator('SUSPICIOUS')
                        }
                    />
                    <Button
                        intent="success"
                        text="Check case"
                        onClick={() =>
                            this.props.changeModeActionCreator('ALL')
                        }
                    />
                    <Button
                        intent="success"
                        text="New playground"
                        onClick={() =>
                            this.props.changePlayground(
                                createPlayground(10, 5, 15),
                            )
                        }
                    />
                </div>
                <div>
                    <Playground
                        playground={this.props.playground}
                        boxPressed={(x, y) =>
                            this.props.boxPressed(
                                x,
                                y,
                                this.props.playground,
                                this.props.mode,
                            )
                        }
                    />
                </div>
            </div>
        )
    }
}

const changePlaygroundActionCreator = playground => {
    return {
        type: 'CHANGE_PLAYGROUND',
        payload: playground,
    }
}

const changeModeActionCreator = mode => {
    return {
        type: 'CHANGE_MODE',
        payload: mode,
    }
}

// DOTO: real game over
const checkBox = (x, y, playground) => {
    if (playground[y][x].open) {
        return playground
    }
    let new_playground = [...playground]
    new_playground[y][x].open = true
    const box = new_playground[y][x]
    if (box.val === -1) {
        alert('PERDU')
    }
    if (box.val === 0) {
        const neighbours = getNeighbours(x, y, new_playground)
        neighbours.map(
            neighbour =>
                (new_playground = checkBox(
                    neighbour.x,
                    neighbour.y,
                    new_playground,
                )),
        )
    }
    return new_playground
}

const checkNeighbours = (x, y, playground) => {
    if (!playground[y][x].open) {
        return playground
    }
    let new_playground = [...playground]
    const box = new_playground[y][x]
    const neighbours = getNeighbours(x, y, new_playground)
    neighbours.map(
        neighbour =>
            (new_playground = checkBox(
                neighbour.x,
                neighbour.y,
                new_playground,
            )),
    )
    return new_playground
}

const boxPressed = (x, y, playground, mode) => {
    switch (mode) {
        case 'ONE':
            return checkBox(x, y, playground)
        case 'ALL':
            return checkNeighbours(x, y, playground)
        default:
            return playground
    }
}

const stateToProps = state => {
    return {
        playground: state.playground,
        mode: state.mode,
    }
}

const dispatchToProps = dispatch => {
    return {
        changePlayground: playground => {
            dispatch(changePlaygroundActionCreator(playground))
            dispatch(changeModeActionCreator('ONE'))
        },
        changeModeActionCreator: mode => {
            dispatch(changeModeActionCreator(mode))
        },
        boxPressed: (x, y, playground, mode) => {
            dispatch(
                changePlaygroundActionCreator(
                    boxPressed(x, y, playground, mode),
                ),
            )
        },
    }
}

export default connect(
    stateToProps,
    dispatchToProps,
)(App)
