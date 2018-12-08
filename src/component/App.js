import React from 'react'
import { connect } from 'react-redux'

import { Button } from '@blueprintjs/core'
import Playground from './Playground'

const RandInt = max => Math.floor(Math.random() * max)

const get = (width, height, x, y) =>
    y >= 0 && y < height && x >= 0 && x < width && [x, y]

const getNeighboursCoords = (width, height, x, y) =>
    [
        get(width, height, x - 1, y - 1),
        get(width, height, x, y - 1),
        get(width, height, x + 1, y - 1),
        get(width, height, x - 1, y),
        get(width, height, x, y),
        get(width, height, x + 1, y),
        get(width, height, x - 1, y + 1),
        get(width, height, x, y + 1),
        get(width, height, x + 1, y + 1),
    ].filter(Array.isArray)

const getNeighbours = (x, y, playground) => {
    const height = playground.length
    const width = playground[0].length
    return getNeighboursCoords(width, height, x, y).map(
        ([x, y]) => playground[y][x],
    )
}

const nArr = n => [...Array(n).keys()] // create an Array of n elements
// ex: nArr(3) -> [0, 1, 2]

// Nice to have: use int value to specify box status (ex: 0: hidden, 1: displayed, 2: flagged, 3: unknown)
const createPlayground = (width, height, nbBombs = 1) => {
    // Place bombs.
    nbBombs = Math.max(1, Math.min(nbBombs, width * height - 1))
    const bombs = {}
    while (nbBombs > 0) {
        const key = RandInt(height) * width + RandInt(width)
        if (bombs[key]) continue
        nbBombs += bombs[key] = -1 // dont do that in real life
    }

    return nArr(height).map(y =>
        nArr(width).map(x => ({
            x,
            y,
            key: y * width + x,
            open: false,
            val:
                bombs[y * width + x] ||
                getNeighboursCoords(width, height, x, y)
                    .map(([x, y]) => -bombs[y * width + x] || 0)
                    .reduce((total, val) => total + val),
            flag: '',
        })),
    )
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
        console.log('PERDU')
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
