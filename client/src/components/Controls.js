import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Input, Button } from 'reactstrap'

import { setSearch, fetchSamples, mergeTracks } from '../actions.js'

const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.list
  , search: state.ui.search
})
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ setSearch, fetchSamples, mergeTracks }, dispatch)

class Controls extends React.Component {

  onClickSearch = () => {
    const { search, fetchSamples } = this.props

    const [chrom, position] = search.split(':')
    const [start, end] = position.split('-')

    fetchSamples({ chrom, start, end })
  }

  onClickMerge = () => {
    this.props.mergeTracks()
  }

  onChange = (ev) => {
    this.props.setSearch(ev.target.value)
  }

  render() {
    const { search, samples, setSearch } = this.props

    return (
      <div className='Controls'>
        <Input
          className='Controls__input'
          onChange={this.onChange}
          value={search}
        />
        <Button className='Controls__search'
          onClick={this.onClickSearch}
        >
          Search
        </Button>
        <Button className='Controls__merge'
          onClick={this.onClickMerge}
          disabled={samples.length === 0}
        >
          View Merged
        </Button>
      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controls);
