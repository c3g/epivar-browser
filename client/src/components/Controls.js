import React, {useCallback, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import debounce from 'lodash/debounce'
import {
  Input,
  InputGroup,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'
import cx from 'clsx'

import Icon from './Icon.js'
import {
  setChrom,
  doSearch,
  setPosition,
  fetchPositions,
} from '../actions.js'
import {useNavigate, useParams} from "react-router-dom";

const defaultChrom = "rsID";

const renderChromName = chr => {
  return ["gene", "rsID"].includes(chr) ? chr : `chr${chr}`;
};

const ChromDropdown = ({chrom, chroms: {isLoading, list}, setChrom}) => {
  return <UncontrolledDropdown className='Controls__chromosome input-group-prepend'>
    <DropdownToggle caret disabled={isLoading}>
      {isLoading && <Icon name='spinner' spin />}
      {!isLoading && (chrom ? renderChromName(chrom) : 'Chrom.')}
    </DropdownToggle>
    <DropdownMenu>
      {list.map(chr =>
        <DropdownItem key={chr} onClick={() => setChrom(chr)}>
          {renderChromName(chr)}</DropdownItem>
      )}
    </DropdownMenu>
  </UncontrolledDropdown>;
};

const Controls = ({toggleHelp}) => {
  const params = useParams();
  const navigate = useNavigate();

  const chroms = useSelector(state => state.chroms);
  const chrom = useSelector(state => state.ui.chrom);
  const positions = useSelector(state => state.positions);
  const position = useSelector(state => state.ui.position);
  const userData = useSelector(state => state.user);

  const dispatch = useDispatch();

  const {chrom: paramsChrom, position: paramsPosition} = params;
  const {isLoading, list} = positions;

  const [didFirstSearch, setDidFirstSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [source, setSource] = useState(null);

  const searchIsLongEnough = useCallback(() => {
    const pStr = position.toString().toLowerCase();
    return chrom !== "rsID"
      || (pStr.startsWith("rs") && pStr.length > 2)
      || !(pStr.startsWith("rs") && pStr.length);
  }, [chrom, position]);

  const debouncedFetch = useCallback(debounce(start => {
    if (searchIsLongEnough()) {
      if (source) {
        console.log("canceling stale autocomplete request")
        source.cancel("stale autocomplete request")
      }
      const newSource = axios.CancelToken.source();
      setSource(newSource);
      dispatch(fetchPositions({chrom, start}, undefined, newSource.token));
    }
  }, 200, {leading: false, trailing: true}), [dispatch, searchIsLongEnough, chrom]);

  const changePosition = useCallback(pos => dispatch(setPosition(pos)),
    [dispatch]);

  // --- Effects --------------------------------------------------------------

  // On mount, if chrom & position are set as params, then populate the Redux state & immediately run a search
  useEffect(() => {
    if (paramsChrom && paramsPosition) {
      dispatch(setChrom(paramsChrom));
      changePosition(paramsPosition);
      dispatch(doSearch());
    }
  }, [dispatch]);

  // If an autocomplete request is in motion when the component is unmounted, try to cancel it.
  useEffect(() => () => {if (source) source.cancel();}, [source]);

  // If the chromosome/search domain in the URL is changed, update the Redux state
  useEffect(() => {
    if (paramsChrom && !chrom) {
      dispatch(setChrom(paramsChrom ?? defaultChrom));
    }
  }, [dispatch, paramsChrom, chrom]);

  // If the chromosome/search domain is changed in Redux, reset the position list
  useEffect(() => {dispatch(fetchPositions({chrom, position: ""}));},
    [dispatch, chrom]);

  // If the position/search term is changed in Redux, fetch the latest autocomplete results
  useEffect(() => {debouncedFetch(position);}, [position]);

  // If the position data changes, reset the selected index
  useEffect(() => {
    setIndex(0);
  }, [positions]);

  // --------------------------------------------------------------------------

  const onChange = useCallback(ev => changePosition(ev.target.value),
    [changePosition]);

  const onFocus = useCallback(() => {
    setTimeout(() => setOpen(true), 100);
  }, []);

  const onBlur = useCallback(() => {
    setTimeout(() => setOpen(false), 200);
  }, []);

  const selectItem = useCallback(index => {
    /** @type {{
     * nat_id: string,
     * position: string,
     * name: string,
     * assay: string,
     * minValueMin: number,
     * nFeatures: number
     * }} */
    const item = list[index];

    const position = item.nat_id ?? item.position ?? item.name;
    // The item assay is the tab with the most significant result - which will be
    // selected first by nature of ordering, thus leading the user to the most interesting
    // detail from the autocomplete.
    navigate(`/explore/locus/${chrom}/${position}/${item.assay}`, {replace: true});
    changePosition(position);
    dispatch(doSearch());
    setDidFirstSearch(true);
  }, [list, dispatch, navigate, changePosition]);

  const moveSelection = useCallback(n => {
    const {length} = list;
    let newIndex = index + n;

    if (index < 0) {
      newIndex = newIndex + length;
    } else if (index > length - 1) {
      newIndex = newIndex % length;
    }

    setIndex(newIndex);
  }, [list]);

  const onKeyDown = useCallback(ev => {
    if (ev.which === 13 /* Enter */) {
      if (list.length > 0) {
        selectItem(index);
      } else {
        dispatch(doSearch());
        setDidFirstSearch(true);
      }

      if (document.activeElement.tagName === 'INPUT')
        document.activeElement.blur()
    }

    if (ev.which === 9 /* Tab */) {
      ev.preventDefault()
      // Shift-tab moves up, tab moves down
      moveSelection(ev.shiftKey ? -1 : +1);
    }
    if (ev.which === 38 /* ArrowUp */) {
      moveSelection(-1)
    }
    if (ev.which === 40 /* ArrowDown */) {
      moveSelection(+1)
    }
  }, [dispatch, selectItem, moveSelection]);

  const setChromCb = useCallback(v => {
    dispatch(setChrom(v));
  }, [dispatch]);

  const onClickSearch = useCallback(() => {
    if (!chrom || !position) return;
    navigate(`/explore/locus/${chrom}/${position}`, {replace: true});
    dispatch(doSearch());
    setDidFirstSearch(true);
  }, [navigate, chrom, position]);

  return <div className={cx('Controls', { didFirstSearch })}>
    <div className='Controls__content'>
      <div style={{display: "flex", flexDirection: "row", width: "100%", maxWidth: "550px"}}>
        <InputGroup style={{flex: 1}}>
          <ChromDropdown chrom={chrom} chroms={chroms} setChrom={setChromCb} />
          <Input
            className='Controls__input autocomplete'
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            value={position || ""}
            disabled={!userData.isLoaded || !userData.data?.consentedToTerms}
            placeholder={(chrom => {
              switch (chrom) {
                case 'rsID':
                  return 'Search by RS ID';
                case 'gene':
                  return 'Search RNA-seq results by gene name';
                default:
                  return 'Search position';
              }
            })(chrom)}
          />
          {
            open &&
            <div className='autocomplete__dropdown-menu'>
              {list.length === 0 && <div className={ 'autocomplete__item autocomplete__item--empty' }>
                <span>{
                  searchIsLongEnough()
                    ? (isLoading ? "Loading..." : "No results")
                    : "Keep typing to see results"
                }</span>
              </div>}
              <div className={(list.length > 0 && isLoading) ? "loading" : ""}>
                {list.map((item, i) =>
                  <div
                    key={item.nat_id ?? item.position ?? item.name}
                    className={ 'autocomplete__item ' + (i === index ? 'autocomplete__item--selected' : '') }
                    onClick={() => selectItem(i)}
                  >
                    { highlight(item.nat_id ?? item.position ?? item.name, position) }
                    <span>
                      <strong>Min. <span style={{fontFamily: "serif"}}>p</span> value:</strong>
                      {' '}
                      {item.minValueMin.toExponential(2)}
                    </span>
                    <span><strong>Features:</strong> {item.nFeatures}</span>
                  </div>
                )}
              </div>
            </div>
          }
          <div className='input-group-append'>
            <Button className='Controls__search'
                    onClick={onClickSearch}
                    disabled={isLoading || !userData.isLoaded || !userData.data?.consentedToTerms}>
              <Icon name={ isLoading ? 'spinner' : 'search' } spin={isLoading} /> Search
            </Button>
          </div>
        </InputGroup>
        <InputGroup style={{marginLeft: "8px"}}>
          <Button onClick={toggleHelp || (() => {})}>
            <Icon name="question-circle-o" /></Button>
        </InputGroup>
      </div>
      <div className='Controls__example'>
        {(!chrom || !["rsID", "gene"].includes(chrom)) && <>
          e.g.: <b>chr11</b> <b>70310556</b> <em>Select chromosome first, then position</em>
        </>}
        {chrom === "rsID" && <>
          e.g.: <b>rs35282812</b> <em>Start typing to search by rsID</em>
        </>}
        {chrom === "gene" && <>
          e.g.: <b>DGKE</b> <em>Start typing to search by gene name (case insensitive)</em>
        </>}
      </div>
    </div>
  </div>;
}

/**
 * Renders a highlighted search prefix, handling case-insensitive searching.
 * @param {number|string} item
 * @param {string} prefix
 * @returns {JSX.Element}
 */
function highlight(item, prefix) {
  const text = String(item).trimStart();
  const textLower = text.toLowerCase();

  const prefixLower = (textLower.startsWith("rs") ? "rs" : "")
    + prefix.trimStart().toLowerCase().replace(/^rs/, "");

  if (!textLower.startsWith(prefixLower)) {
    // Prefix isn't in search text, so don't render any highlighting.
    return <span>{text}</span>;
  }

  return <span>
    <span className="highlight">{text.substring(0, prefixLower.length)}</span>
    {text.substring(prefixLower.length)}
  </span>;
}

export default Controls;
