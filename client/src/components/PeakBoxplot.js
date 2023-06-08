import React, {useEffect, useRef, useState} from 'react';

import { ETHNICITY_COLOR } from '../constants/app'

function PeakBoxplot({ title, peak, /*values = defaultValues*/ }) {
  const [loaded, setLoaded] = useState(false);
  const prevPeakRef = useRef();

  useEffect(() => {
    if (prevPeakRef.current !== peak?.id) {
      setLoaded(false);
      prevPeakRef.current = peak?.id;
    }
  }, [peak]);

  const peakImg = `${process.env.PUBLIC_URL}/api/tracks/plot/${peak?.id}`;

  return (
    <div className={"PeakBoxplot" + (loaded ? "" : " loading")}>
      <h6 className='text-center'>{title}</h6>
      <div className='PeakBoxplot__graphs'>
        {
          peak && (
            <img width={700}
                 height={350}
                 style={{
                   width: "100%",
                   height: "auto",
                   maxWidth: 700,
                   opacity: loaded ? 1 : 0,
                   transition: "opacity ease-in-out 0.3s",
                 }}
                 onLoad={() => setLoaded(true)}
                 src={peakImg}
                 alt="Peak Box Plots"/>
          )
        }
      </div>
      <div className='PeakBoxplot__legend'>
        <div className='PeakBoxplot__legend__item'>
          <span style={{ background: ETHNICITY_COLOR.AF }} /> African-American
        </div>
        <div className='PeakBoxplot__legend__item'>
          <span style={{ background: ETHNICITY_COLOR.EU }} /> European-American
        </div>
      </div>
      <div className="PeakBoxplot__disclaimer">
        <p>
          Box plots are generated from normalised signals (read count per base pair per 10 million reads), without any
          batch correction, whereas <em>p</em>-values are calculated from age-regressed, batch-corrected
          signal values. The <em>p</em>-values thus may not precisely match the distributions visible in the box plots.
        </p>
      </div>
    </div>
  )
}

export default PeakBoxplot
