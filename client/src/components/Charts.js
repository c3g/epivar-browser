import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  Container, Col, Row,
  UncontrolledTooltip,
} from 'reactstrap'

import Icon from './Icon.js'
import AutoSizer from './AutoSizer.js'
import BoxPlot from './BoxPlot.js'
import { setRange, mergeTracks, handleError } from '../actions.js'

const mapStateToProps = state => ({
  isLoading: state.samples.isLoading,
  isEmpty:
    state.samples.stats.total > 0
    && state.values.isLoading === false
    && Object.keys(state.values.map).length === 0,
  values: state.values,
  range: state.ui.range,
})
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ setRange, mergeTracks, handleError }, dispatch)

const ETHNICITY_NAME = {
  AF: 'African',
  EU: 'Europen',
}

class Charts extends Component {

  onClickMerge(assay) {
    this.props.mergeTracks(assay)
  }

  render() {
    const { isEmpty, values } = this.props

    const data = getDataFromValues(values)

    const groups = makeSubgroups(data, 2)

    return (
      <div className={'Charts ' + (values.isLoading ? 'loading' : '')}>
        <Container>
          {
            isEmpty &&
              <div className='Charts__empty'>
                No results for the selected range.<br/>
                Try with a different range.
              </div>
          }
          {
            data.length > 0 &&
              <Row className='Charts__top'>
                <Col xs='12'>
                  <div className='Charts__legend'>
                    The box plots display, per genotype, the average signal within the specified genomic region.
                    Some donors may have more than one track. In those cases, only the first one is kept.<br/>
                    Some data might be <span className='Charts__hidden'>Hidden</span> for privacy reasons (when <code>n ≤ 3</code>).
                  </div>
                </Col>
                <Col xs='12'>
                  <div className='Charts__controls d-flex'>
                    <InputGroup>
                      <InputGroupAddon addonType='prepend'>Merge window size</InputGroupAddon>
                      <Input
                        type='number'
                        className='Charts__range'
                        value={this.props.range}
                        onChange={ev => this.props.setRange(+ev.target.value)}
                      />
                    </InputGroup>
                    <Icon id='help-tooltip-icon' name='question-circle' className='Controls__help' />
                    <UncontrolledTooltip placement='right' target='help-tooltip-icon'>
                      The Merge buttons below merge tracks for each experiment/category together, into a single track.
                      This input field allows you to choose the window size that will be merged, in bases.
                    </UncontrolledTooltip>
                  </div>
                </Col>
              </Row>
          }
          {
            groups.map((group, i) =>
              <Row key={i}>
                {
                  group.map(({ assay, ethnicity, data }) =>
                    <Col sm='6' key={assay}>
                      <AutoSizer disableHeight>
                        {
                          ({ width }) =>
                            <div key={assay + '_element'} className='Charts__box' style={{ width }}>
                              <BoxPlot
                                title={ethnicity ? `${assay} - ${ETHNICITY_NAME[ethnicity]}` : assay}
                                data={data}
                                width={width}
                                height={300}
                                domain={getDomain(data)}
                              />
                              <Button className='Charts__merge' onClick={() => this.onClickMerge(assay)}>
                                Merge
                              </Button>
                            </div>
                        }
                      </AutoSizer>
                    </Col>
                  )
                }
              </Row>
            )
          }
        </Container>
      </div>
    )
  }
}

function getDomain(categories) {

  let min =  Infinity
  let max = -Infinity

  categories.forEach(({ data }) => {
    if (data.min < min)
      min = data.min
    if (data.max > max)
      max = data.max
  })

  const delta = max !== min ? max - min : 1

  const padding = Math.round(delta * 0.1 * 4) / 4

  let start = min - padding
  let end   = max + padding

  if (0 < min && Math.abs(min) < (delta * 0.5))
    start = 0

  start = Math.round(start * 100) / 100
  // end = end

  return [
    start,
    end,
  ]
}

function makeSubgroups(list, n) {
  return list.reduce((acc, current) => {
    const lastSubArray = acc[acc.length - 1]

    if (!lastSubArray || lastSubArray.length >= n) {
      acc.push([])
    }

    acc[acc.length - 1].push(current)

    return acc
  }, [])
}

function getDataFromValues(values) {
  return Object.entries(values.map)
  .map(([assay, valuesByEthnicity]) =>
    Object.entries(valuesByEthnicity).map(([ethnicity, valuesByType]) =>
      ({
        assay,
        ethnicity,
        data: [
          { name: 'Hom Ref', data: valuesByType.REF || [] },
          { name: 'Het',     data: valuesByType.HET || [] },
          { name: 'Hom Alt', data: valuesByType.HOM || [] }
        ]
      })
    )
  )
  .flat()
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
