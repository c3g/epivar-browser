import React, {useEffect} from 'react'
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate, useParams} from "react-router-dom";
import { Container, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { groupBy, prop } from 'rambda'
import memoizeOne from 'memoize-one'
import cx from 'clsx'

import Icon from './Icon'
import PeakAssay from './PeakAssay'
import {doSearch, setChrom, setPosition} from "../actions";

const groupAndSortPeaks = memoizeOne(groupBy(prop('assay')));

const PeakResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const {node, chrom, position, assay: activeAssay} = params;

  const assays = useSelector(state => state.assays.list || []);

  const peaksLoading = useSelector(state => state.peaks.isLoading);
  const peaksLoaded = useSelector(state => state.peaks.isLoaded);
  const isEmpty = useSelector(state => state.peaks.isLoaded && state.peaks.list.length === 0);
  const peaks = useSelector(state => state.peaks.list || []);

  const {chrom: uiChrom, position: uiPosition} = useSelector(state => state.ui);

  const peaksByAssay = groupAndSortPeaks(peaks);
  const assaysWithFeatures = Object.keys(peaksByAssay);
  const entries = Object.entries(peaksByAssay);

  useEffect(() => {
    if (!chrom || !position) return;  // If chromosome or position are undefined, don't push us anywhere

    if (activeAssay && !(activeAssay in peaksByAssay) && peaksLoaded) {
      // Assay isn't valid for the position in question
      const url = `/datasets/${node}/explore/locus/${chrom}/${position}` +
        (assaysWithFeatures.length ? `/${assays[0]}` : "");
      console.info(`assay ${activeAssay} isn't valid for the locus in question; navigating to ${url}`);
      navigate(url, {replace: true});
    } else if (!activeAssay && assaysWithFeatures.length && peaksLoaded) {
      const url = `/datasets/${node}/explore/locus/${chrom}/${position}/${assaysWithFeatures[0]}`;
      console.info(`no assay selected; navigating to ${url}`);
      navigate(url, {replace: true});
    }
  }, [activeAssay, chrom, position, peaksLoaded]);

  useEffect(() => {
    // Some weird back/forward behaviour can occur if we don't update the UI state and re-fetch peaks
    // when the URL changes (which we ensure via effect dependencies).

    if (!chrom || !position) return;  // If chromosome or position are undefined, don't do any UI updates

    if (uiChrom !== chrom || uiPosition !== position) {
      // URL has changed, but UI wasn't updated - dependencies ensure this case but not the opposite.
      dispatch(setChrom(chrom));
      dispatch(setPosition(position));
      dispatch(doSearch());  // Re-fetch the peaks if the URL changes
    }

    // Explicitly don't depend on uiChrom or uiPosition
    // - only check if our URL doesn't match the UI if the URL changes, not if the UI changes.
  }, [chrom, position]);

  return <div className={'PeakResults ' + (peaksLoading ? 'loading' : '')}>
    {
      chrom && position && (peaksLoading || peaksLoaded) &&
      <Container fluid={true} style={{maxWidth: 1240}}>
        <Nav tabs>
          {
            assays.map(assay => {
              const pba = peaksByAssay[assay] ?? [];
              const nPeaks = pba.length;
              const nUniqueGenes = (new Set(pba.map(p => p.gene))).size;
              const nUniqueSNPs = (new Set(pba.map(p => p.snp.id))).size;

              // If we've searched by gene (i.e. # of unique genes = 1), use # SNPs, otherwise use # genes
              // for the RNA-seq tab header. Basically, show the most meaningful count.
              const countDisplay = assay === "RNA-seq"
                ? (nUniqueGenes === 1 ? nUniqueSNPs : nUniqueGenes)
                : nPeaks;
              const countStr = (
                assay === "RNA-seq"
                  ? (nUniqueGenes === 1 ? "SNP" : "gene")
                  : "assoc"  // TODO: revert to peak + do unique peaks instead?
              ) + (countDisplay !== 1 ? "s" : "");  // Use != rather than >, cause English likes 0 quantities plural

              return <NavItem key={assay}>
                <NavLink
                  className={cx({active: activeAssay === assay})}
                  onClick={() =>
                    nPeaks && navigate(
                      `/datasets/${node}/explore/locus/${chrom}/${position}/${assay}`,
                      {replace: true})}
                  disabled={!nPeaks}
                  aria-disabled={true}
                >
                  <Icon name='flask' className='PeakAssay__icon'/>
                  <strong>{assay}</strong>&nbsp;-&nbsp;
                  {countDisplay}&nbsp;{countStr}
                </NavLink>
              </NavItem>
            })
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
    {
      isEmpty &&
      <Container>
        <div className='PeakResults__empty'>
          No results for the selected search term.<br/>
          Try something different.
        </div>
      </Container>
    }
  </div>;
};

export default PeakResults;
