import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

function PeakBoxplot({ title, peak, /*values = defaultValues*/ }) {
  const ethnicities = useState(state => state.ethnicities.list);

  const [loaded, setLoaded] = useState(false);
  const prevPeakRef = useRef();

  useEffect(() => {
    if (prevPeakRef.current !== peak?.id) {
      setLoaded(false);
      prevPeakRef.current = peak?.id;
    }
  }, [peak]);

  const peakImg = `${process.env.PUBLIC_URL}/api/tracks/plot/${peak?.id}`;
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
