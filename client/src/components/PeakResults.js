import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap'
import { groupBy, prop } from 'rambda'

import PeakAssay from './PeakAssay'

const mapStateToProps = state => ({
  isLoading: state.peaks.isLoading,
  isEmpty: state.peaks.isLoaded && state.peaks.list.length === 0,
  peaks: state.peaks.list,
})
const mapDispatchToProps = {}


class PeakResults extends Component {
  render() {
    const { isLoading, isEmpty, peaks } = this.props

    const peaksByAssay = groupBy(prop('assay'), peaks)

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
          Object.entries(peaksByAssay).map(([assay, peaks]) =>
            <PeakAssay assay={assay} peaks={peaks} />
          )
        }
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeakResults);
