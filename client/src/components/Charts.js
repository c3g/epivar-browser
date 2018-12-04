import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from 'reactstrap'

import Icon from './Icon.js'
import AutoSizer from './AutoSizer.js'
import BoxPlot from './BoxPlot.js'
import { setRange, mergeTracks, handleError } from '../actions.js'

const mapStateToProps = state => ({
  isLoading: state.samples.isLoading,
  values: state.values,
  range: state.ui.range,
})
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ setRange, mergeTracks, handleError }, dispatch)


class Charts extends Component {

  onClickMerge(assay, data) {
    const sampleNames = Object.values(data).reduce((acc, cur) => acc.concat(cur.data.map(n => n.donor)), [])
    this.props.mergeTracks(sampleNames)
  }

  render() {
    const { values } = this.props

    const data = Object.entries(values.map).map(([assay, valuesByType]) =>
      ({
        assay,
        data: [
          { name: 'Hom Ref', data: valuesByType.REF || [] },
          { name: 'Het',     data: valuesByType.HET || [] },
          { name: 'Hom Alt', data: valuesByType.HOM || [] }
        ]
      })
    )

    return (
      <div>

        <div className='Charts__controls d-flex'>
          <InputGroup>
            <InputGroupAddon addonType="prepend">Merge window size</InputGroupAddon>
            <Input
              type='number'
              className='Controls__size'
              ref='size'
              value={this.props.range}
              onChange={ev => this.props.setRange(+ev.target.value)}
            />
          </InputGroup>
          <Icon id='help-tooltip-icon' name='question-circle' className='Controls__help' />
          <UncontrolledTooltip placement='right' target='help-tooltip-icon'>
            The Merge button merge tracks for each experiment/category together, into a single track.
            The input field allows you to choose the window size that will be merged, in bases.
          </UncontrolledTooltip>
        </div>

        <AutoSizer disableHeight>
          {
            ({ width }) =>
              data.map(({ assay, data }) =>
                <div>
                  <BoxPlot title={assay}
                    data={data}
                    width={width}
                    height={300}
                    padding={40}
                    domain={getDomain(data)}
                  />
                  <Button onClick={() => this.onClickMerge(assay, data)}>
                    Merge
                  </Button>
                </div>
              )
          }
        </AutoSizer>
      </div>
    )
  }
}

function getDomain(dataList) {
  let min = Infinity
  let max = -Infinity

  dataList.forEach(({ data }) =>
    data.forEach(d => {
      if (d.data < min)
        min = d.data
      if (d.data > max)
        max = d.data
    })
  )

  const delta = max !== min ? max - min : 1

  return [
    min - delta * 0.1,
    max + delta * 0.1,
  ]
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
