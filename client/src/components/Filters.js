/*
 * Filters.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Button,
  ButtonGroup,
  Dropdown,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import cx from 'classname';
import { compose, uniq } from 'ramda';

import { PROPERTIES } from '../constants.js';
import { setFilter, clearFilters } from '../actions.js';

const { keys } = Object

const mapStateToProps = state => ({
  samples: state.samples.list,
  filters: state.ui.filters,
})
const mapDispatchToProps = dispatch => ({
  setFilter: compose(dispatch, setFilter),
  clearFilters: compose(dispatch, clearFilters),
})

class Filters extends Component {
  render() {

    const { samples, filters, setFilter, clearFilters } = this.props

    const userValues     = uniq(samples.map(PROPERTIES.user.selector))
    const pipelineValues = uniq(samples.map(PROPERTIES.pipeline.selector))
    const statusOptions  = PROPERTIES.status.options

    return (
      <div className='d-flex'>

        <div className='flex-static'>
          <span className='label'>Pipeline</span>
          <UncontrolledButtonDropdown className='dropdown--inline'>
            <DropdownToggle caret>
              { filters.pipeline || 'All' }
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setFilter('pipeline', undefined)}>All</DropdownItem>
              {
                pipelineValues.map(value => {
                  return (
                    <DropdownItem key={value}
                      onClick={() => setFilter('pipeline', value)}>{ value }</DropdownItem>
                  )
                })
              }

            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>

        <span className='flex-static vertical-hr' />
        <div className='flex-static'>
          <span className='label'>User</span>
          <UncontrolledButtonDropdown className='dropdown--inline'>
            <DropdownToggle caret>
              { filters.user || 'All' }
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setFilter('user', undefined)}>All</DropdownItem>
              {
                userValues.map(value => {
                  return (
                    <DropdownItem key={value}
                      onClick={() => setFilter('user', value)}>{ value }</DropdownItem>
                  )
                })
              }

            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>

        <span className='flex-static vertical-hr' />
        <div className='flex-static'>
          <span className='label'>Status</span>
          <UncontrolledButtonDropdown className='dropdown--inline'>
            <DropdownToggle caret>
              { (filters.status && titleCase(filters.status.text)) || 'All' }
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => setFilter('status', undefined)}>All</DropdownItem>
              {
                statusOptions.map(option => {
                  return (
                    <DropdownItem key={option.value}
                      onClick={() => setFilter('status', option)}>{ titleCase(option.text) }</DropdownItem>
                  )
                })
              }

            </DropdownMenu>
          </UncontrolledButtonDropdown>
        </div>

        <div className='flex-fill' />

        <div className='flex-static'>
          <Button onClick={clearFilters}>
            <i className='fa fa-remove' /> Clear Filters
          </Button>
        </div>
      </div>
    )
  }

}

function titleCase(value) {
  if (!value)
    return ''
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filters);
