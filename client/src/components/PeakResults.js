import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Container, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { groupBy, sortBy, prop, map, reverse, compose } from 'rambda'
import memoizeOne from 'memoize-one'
import cx from 'clsx'

import Icon from './Icon'
import PeakAssay from './PeakAssay'

const mapStateToProps = state => ({
  isLoading: state.peaks.isLoading,
  isLoaded: state.peaks.isLoaded,
  isEmpty: state.peaks.isLoaded && state.peaks.list.length === 0,
  peaks: state.peaks.list || [],
})
const mapDispatchToProps = {}

// Original data comes sorted by order of priority, therefore we
// sort by ID because it's also the priority field.
const groupAndSortPeaks = memoizeOne(
  compose(map(compose(reverse, sortBy(prop('id')))), groupBy(prop('assay')))
)

class PeakResults extends Component {
  state = {
    activeTab: null,
  }

  setTab = activeTab => {
    this.setState({ activeTab })
  }

  static getDerivedStateFromProps(props, state) {
    const peaksByAssay = groupAndSortPeaks(props.peaks || [])
    const assays = Object.keys(peaksByAssay)

    if (state.activeTab !== null && !(state.activeTab in peaksByAssay))
      return { activeTab: assays.length > 0 ? assays[0] : null }

    if (state.activeTab === null && assays.length > 0)
      return { activeTab: assays[0] }
  }

  render() {
    const { activeTab } = this.state
    const { isLoading, isLoaded, isEmpty, peaks } = this.props

    const peaksByAssay = groupAndSortPeaks(peaks)
    const entries = Object.entries(peaksByAssay)

    return (
      <div className={'PeakResults ' + (isLoading ? 'loading' : '')}>
        {
          isEmpty &&
            <Container>
              <div className='PeakResults__empty'>
                No results for the selected range.<br/>
                Try with a different range.
              </div>
            </Container>
        }
        {
          (isLoading || isLoaded) &&
            <Container>
              <Nav tabs>
                {
                  entries.map(([assay, peaks]) =>
                    <NavItem key={assay}>
                      <NavLink
                        className={cx({ active: activeTab === assay })}
                        onClick={() => this.setTab(assay)}
                      >
                        <Icon name='flask' className='PeakAssay__icon' /><strong>{assay}</strong> - {peaks.length} peak{peaks.length > 1 ? 's' : ''}
                      </NavLink>
                    </NavItem>
                  )
                }
              </Nav>
              <TabContent activeTab={activeTab}>
                {
                  entries.map(([assay, peaks]) =>
                    <TabPane tabId={assay}>
                      <PeakAssay assay={assay} peaks={peaks} />
                    </TabPane>
                  )
                }
              </TabContent>
            </Container>
        }
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeakResults);
