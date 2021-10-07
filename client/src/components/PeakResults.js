import React, {useEffect} from 'react'
import {useSelector} from 'react-redux';
import { Container, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { groupBy, sortBy, prop, map, compose } from 'rambda'
import memoizeOne from 'memoize-one'
import cx from 'clsx'

import Icon from './Icon'
import PeakAssay from './PeakAssay'
import {useHistory, useRouteMatch} from "react-router-dom";

// Original data comes sorted by order of priority, therefore we
// sort by ID because it's also the priority field.
const groupAndSortPeaks = memoizeOne(
  compose(map(sortBy(prop('valueNI'))), groupBy(prop('assay')))
)

const PeakResults = () => {
  const history = useHistory();
  const match = useRouteMatch();
  const {chrom, position} = match.params;
  const activeAssay = match.params.assay;

  const isLoading = useSelector(state => state.peaks.isLoading);
  const isLoaded = useSelector(state => state.peaks.isLoaded);
  const isEmpty = useSelector(state => state.peaks.isLoaded && state.peaks.list.length === 0);
  const peaks = useSelector(state => state.peaks.list || []);

  const peaksByAssay = groupAndSortPeaks(peaks);
  const assays = Object.keys(peaksByAssay);
  const entries = Object.entries(peaksByAssay);

  useEffect(() => {
    if (!chrom || !position) return;  // If chromosome or position are undefined, don't push us anywhere

    if (activeAssay && !(activeAssay in peaksByAssay) && isLoaded) {
      // Assay isn't valid for the position in question
      history.replace(`/${chrom}/${position}` + (assays.length ? `/${assays[0]}` : ""));
    } else if (!activeAssay && assays.length && isLoaded) {
      history.replace(`/${chrom}/${position}/${assays[0]}`);
    }
  }, [activeAssay, chrom, position, isLoaded]);

  return <div className={'PeakResults ' + (isLoading ? 'loading' : '')}>
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
      chrom && position && (isLoading || isLoaded) &&
      <Container>
        <Nav tabs>
          {
            entries.map(([assay, peaks]) =>
              <NavItem key={assay}>
                <NavLink
                  className={cx({ active: activeAssay === assay })}
                  onClick={() => history.replace(`/${chrom}/${position}/${assay}`)}
                >
                  <Icon name='flask' className='PeakAssay__icon' />
                  <strong>{assay}</strong>&nbsp;-&nbsp;
                  {peaks.length} {assay === 'RNA-seq' ? 'gene' : 'peak'}{peaks.length > 1 ? 's' : ''}
                </NavLink>
              </NavItem>
            )
          }
        </Nav>
        <TabContent activeTab={activeAssay}>
          {
            entries.map(([assay, peaks]) =>
              <TabPane key={assay} tabId={assay}>
                <PeakAssay assay={assay} peaks={peaks} />
              </TabPane>
            )
          }
        </TabContent>
      </Container>
    }
  </div>;
};

export default PeakResults;
