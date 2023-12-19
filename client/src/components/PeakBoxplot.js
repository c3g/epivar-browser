import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import {useNode} from "../helpers/node";

function PeakBoxplot({ title, peak, /*values = defaultValues*/ }) {
  const ethnicities = useSelector(state => state.ethnicities.list);
  const node = useNode();
  const usePrecomputed = useSelector(state => state.ui.usePrecomputed);

  const [loaded, setLoaded] = useState(false);
  const prevPeakImgRef = useRef("");

  const peakImg = `${node}/tracks/plot/${peak?.id}?precomputed=${Number(usePrecomputed)}`;

  useEffect(() => {
    if (prevPeakImgRef.current !== peakImg) {
      setLoaded(false);
      prevPeakImgRef.current = peakImg;
    }
  }, [peakImg]);

  const peakImgStyle = useMemo(() => ({
    width: "100%",
    height: "auto",
    maxWidth: 700,
    opacity: loaded ? 1 : 0,
    transition: "opacity ease-in-out 0.3s",
  }), [loaded]);
  const peakImgOnLoad = useCallback(() => setLoaded(true), []);

  return (
    <div className={"PeakBoxplot" + (loaded ? "" : " loading")}>
      <h6 className='text-center'>{title}</h6>
      <div className='PeakBoxplot__graphs'>
        {
          peak ? (
            <img
              width={700}
              height={350}
              style={peakImgStyle}
              onLoad={peakImgOnLoad}
              src={peakImg}
              alt="Peak Box Plots"
            />
          ) : (
            <div style={{width: 700, height: 350}} />
          )
        }
      </div>
      <div className='PeakBoxplot__legend'>
        {ethnicities.map(({id, name, plotColor}) => (
          <div className='PeakBoxplot__legend__item' key={id}>
            <span style={{ background: plotColor }} /> {name}
          </div>
        ))}
      </div>
      <div className="PeakBoxplot__disclaimer">
        {
          usePrecomputed
            ? <p>
              The box plots shown here use pre-computed, read-count normalized, batch corrected, age- and PCs-regressed
              values. When a "Tracks" external link is clicked, the UCSC browser will be pre-loaded with bigWig data
              merged on-the-fly using per-sample/condition signal data. These data ARE NOT batch-corrected nor
              age-regressed, and thus may not match the distributions visible in the box plots.
            </p>
            : <p>
              When not using precomputed values, box plots are generated from normalised signals (read count per base
              pair per 10 million reads), without any batch correction, whereas <em>p</em>-values are calculated from
              the age-regressed, batch-corrected signal values. The <em>p</em>-values thus may not precisely match the
              distributions visible in the box plots.
            </p>
        }
      </div>
    </div>
  )
}

export default PeakBoxplot
