import React from 'react'

import Box from './Box'

import '../style.css'

const drawRow = (row, props) => (
  <div key={row[0].y}>
    {row.map(box => (
      <Box
        key={box.key}
        value={box.open ? box.val : '-'}
        boxPressed={props.boxPressed}
        box={box}
        className="Box"
      />
    ))}
  </div>
)

const Playground = props => {
  if (props.playground.length === 0) {
    return <div>Create a new playground</div>
  }
  return (
    <div className="Playground">
      {props.playground.map(row => drawRow(row, props))}
    </div>
  )
}

export default Playground
