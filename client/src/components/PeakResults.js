import React, {useEffect} from 'react'
import {useSelector} from 'react-redux';
import {useNavigate, useParams} from "react-router-dom";
import { Container, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { groupBy, prop } from 'rambda'
import memoizeOne from 'memoize-one'
import cx from 'clsx'

import Icon from './Icon'
import PeakAssay from './PeakAssay'

const groupAndSortPeaks = memoizeOne(groupBy(prop('assay')));

const PeakResults = () => {
  const navigate = useNavigate();
  const params = useParams();
  const {chrom, position, assay: activeAssay} = params;

  const assays = useSelector(state => state.assays.list || []);

  const peaksLoading = useSelector(state => state.peaks.isLoading);
  const peaksLoaded = useSelector(state => state.peaks.isLoaded);
  const isEmpty = useSelector(state => state.peaks.isLoaded && state.peaks.list.length === 0);
  const peaks = useSelector(state => state.peaks.list || []);

  const peaksByAssay = groupAndSortPeaks(peaks);
  const assaysWithFeatures = Object.keys(peaksByAssay);
  const entries = Object.entries(peaksByAssay);

  useEffect(() => {
    if (!chrom || !position) return;  // If chromosome or position are undefined, don't push us anywhere

    if (activeAssay && !(activeAssay in peaksByAssay) && peaksLoaded) {
      // Assay isn't valid for the position in question
      navigate(`/locus/${chrom}/${position}` + (assaysWithFeatures.length ? `/${assays[0]}` : ""), {replace: true});
    } else if (!activeAssay && assaysWithFeatures.length && peaksLoaded) {
      navigate(`/locus/${chrom}/${position}/${assaysWithFeatures[0]}`, {replace: true});
    }
  }, [activeAssay, chrom, position, peaksLoaded]);

  return <div className={'PeakResults ' + (peaksLoading ? 'loading' : '')}>
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
      chrom && position && (peaksLoading || peaksLoaded) &&
      <Container>
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
                  : "peak"
              ) + (countDisplay !== 1 ? "s" : "");  // Use != rather than >, cause English likes 0 quantities plural

              return <NavItem key={assay}>
                <NavLink
                  className={cx({active: activeAssay === assay})}
                  onClick={() => nPeaks && navigate(`/locus/${chrom}/${position}/${assay}`, {replace: true})}
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
  </div>;
};

export default PeakResults;
