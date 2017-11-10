/*
 * Order.js
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
import { compose } from 'ramda';

import { PROPERTIES } from '../constants.js';
import { setOrder, setOrderDirection } from '../actions.js';

const { keys } = Object

const mapStateToProps = state => ({
  currentOrder: state.ui.ordering.property,
  ascending: state.ui.ordering.ascending
})
const mapDispatchToProps = dispatch => ({
  setOrder: compose(dispatch, setOrder),
  setOrderDirection: compose(dispatch, setOrderDirection)
})

class Order extends Component {
  render() {

    const {
      ascending,
      currentOrder,
      setOrder,
      setOrderDirection
    } = this.props

    const currentValue = PROPERTIES[currentOrder].name

    return (
      <ButtonGroup>
        <UncontrolledButtonDropdown className='dropdown--inline'>
          <DropdownToggle caret>
            { currentValue }
          </DropdownToggle>
          <DropdownMenu>
            {
              keys(PROPERTIES).map(which => {
                const property = PROPERTIES[which]
                return (
                  <DropdownItem key={which} onClick={() => setOrder(which)}>{ property.name }</DropdownItem>
                )
              })
            }

          </DropdownMenu>
        </UncontrolledButtonDropdown>
        <Button className={ 'fa ' + (ascending ? 'fa-sort-amount-asc' : 'fa-sort-amount-desc') }
          onClick={() => setOrderDirection(!ascending)}
        />
      </ButtonGroup>
    )
  }

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Order);
