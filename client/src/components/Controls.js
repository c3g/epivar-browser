import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Container, Input, Button } from 'reactstrap'

import Icon from './Icon.js'
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
    const { isLoading, search, samples, setSearch } = this.props

    return (
      <div className='Controls d-flex'>
        <Input
          className='Controls__input'
          onChange={this.onChange}
          value={search}
          placeHolder='chr1:10000'
        />
        <Button className='Controls__search'
          onClick={this.onClickSearch}
          disabled={isLoading}
        >
          <Icon name={ isLoading ? 'spinner' : 'search' } spin={isLoading} /> Search
        </Button>
        <Button className='Controls__merge'
          onClick={this.onClickMerge}
          disabled={samples.length === 0}
        >
          <Icon name='compress' /> Merge
        </Button>
      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controls);
