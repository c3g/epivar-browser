/*
 * SearchInput.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, InputGroup, InputGroupButton, Button } from 'reactstrap';
import { compose } from 'ramda';

import { search } from '../actions';

const { keys, values, entries } = Object




const mapStateToProps = state => ({
  value: state.ui.search
})
const mapDispatchToProps = dispatch => ({
  search: compose(dispatch, search)
})

class SearchInput extends Component {
  constructor() {
    super()

    this.onChange = this.onChange.bind(this)
    this.onClickClear = this.onClickClear.bind(this)
  }

  onChange(ev) {
    this.props.search(ev.target.value)
  }

  onClickClear(ev) {
    this.props.search('')
  }

  render() {

    const { value } = this.props

    return (
      <InputGroup>
        <Input value={value} placeholder='Search...' onChange={this.onChange}/>
        <InputGroupButton>
          <Button onClick={this.onClickClear}>Clear</Button>
        </InputGroupButton>
      </InputGroup>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchInput);
