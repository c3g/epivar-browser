import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.stats
  , values: state.values
})

function ParamsTable(props) {
  const { isLoading, samples } = props
  const counts =
    Object.entries(samples.counts)
          .map(([key, value]) => ({ key: key, count: value }))

  const showParams = !isLoading && samples.total > 0

  return (
    <Table className={ 'Params ' + ( showParams ? 'visible' : '' ) }>
      <thead>
        <tr>
          <th>Chrom</th>
          <th>Start</th>
          <th>End</th>
          <th>Reference</th>
          {
            counts.map(({key}) =>
              <th key={key}>{key}</th>
            )
          }
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{samples.chrom}</td>
          <td>{samples.start}</td>
          <td>{samples.end}</td>
          <td>{samples.ref}</td>
          {
            counts.map(({key, count}) =>
              <th key={key}>{count}</th>
            )
          }
        </tr>
      </tbody>
    </Table>
  )
}

export default connect(mapStateToProps, undefined)(ParamsTable);
