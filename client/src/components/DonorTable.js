/*
 * DonorTable.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { compose } from 'ramda';


import { renderColumn } from '../helpers/table';
import { selectDonor, deselectDonor } from '../actions';
import { selectAllDonors, deselectAllDonors } from '../actions';
import { SELECTION_COLOR, DONOR_COLUMNS } from '../constants';

const { values } = Object





const mapStateToProps = state => ({
  selected: [...state.ui.selection.donors]
})
const mapDispatchToProps = dispatch => ({
    selectDonor:       compose(dispatch, selectDonor)
  , deselectDonor:     compose(dispatch, deselectDonor)
  , selectAllDonors:   compose(dispatch, selectAllDonors)
  , deselectAllDonors: compose(dispatch, deselectAllDonors)
})
class DonorTable extends Component {

  render() {

    const { donors, selected } = this.props
    const { selectDonor, deselectDonor, selectAllDonors, deselectAllDonors } = this.props

    const options = {
      sizePerPage: 15,
      hideSizePerPage: true
    }
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      bgColor: SELECTION_COLOR,
      onSelect: (donor, isSelected, e) => isSelected ? selectDonor(donor.id) : deselectDonor(donor.id),
      onSelectAll: (isSelected, rows) => isSelected ? selectAllDonors() : deselectAllDonors(),
      selected: selected
    }

    return (
      <div className='DonorTable table-sm'>
        <Table data={donors} version='4'
            selectRow={selectRowProp}
            options={options}
            pagination={true}
        >
          {
            DONOR_COLUMNS.map(renderColumn)
          }
        </Table>
      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DonorTable);
