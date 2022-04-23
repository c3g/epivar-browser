import React from 'react'
import { connect } from 'react-redux'
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
  fetchSamples,
  fetchPositions,
  handleError,
} from '../actions.js'

const mapStateToProps = state => ({
  isLoading: state.samples.isLoading,
  samples: state.samples.list,
  chroms: state.chroms,
  chrom: state.ui.chrom,
  windowStart: state.ui.windowStart,
  windowEnd: state.ui.windowEnd,
  positions: state.positions,
  position: state.ui.position,
  range: state.ui.range,
  userData: state.user,
})
const mapDispatchToProps = {
  setChrom,
  doSearch,
  setPosition,
  fetchSamples,
  fetchPositions,
  handleError
};

const defaultChrom = "rsID";

class Controls extends React.Component {

  state = {
    index: 0,
    open: false,
    didFirstSearch: false,
    source: undefined,
  }

  componentDidMount() {
    const { params: {chrom, position} } = this.props;
    if (chrom && position) {
      this.props.setChrom(chrom);
      this.changePosition(position);
      this.props.doSearch();
    }
  }

  componentWillUnmount() {
    if (this.state.source) {
      this.state.source.cancel()
    }
  }

  componentWillReceiveProps(nextProps, _nextContext) {
    if (nextProps.params?.chrom !== this.props.params?.chrom) {
      const { params: {chrom} } = nextProps;
      this.props.setChrom(chrom ?? defaultChrom);
    }
    if (nextProps.chrom !== this.props.chrom) {
      const {chrom} = nextProps
      this.props.fetchPositions({ chrom, position: '' })
    }
    if (nextProps.positions !== this.props.positions) {
      this.setState({ index: 0 })
    }
  }

  onFocus = () => {
    setTimeout(() => this.setState({ open: true }), 100)
  }

  onBlur = () => {
    setTimeout(() => {
      this.setState({ open: false })
    }, 200)
  }

  onKeyDown = ev => {
    if (ev.which === 13 /* Enter */) {
      if (this.props.positions.list.length > 0) {
        this.selectItem(this.state.index);
      } else {
        this.props.doSearch();
      }

      if (document.activeElement.tagName === 'INPUT')
        document.activeElement.blur()
    }

    if (ev.which === 9 /* Tab */) {
      ev.preventDefault()
      if (ev.shiftKey)
        this.moveSelection(-1)
      else
        this.moveSelection(+1)
    }
    if (ev.which === 38 /* ArrowUp */) {
      this.moveSelection(-1)
    }
    if (ev.which === 40 /* ArrowDown */) {
      this.moveSelection(+1)
    }
  }

  onClickSearch = () => {
    this.props.doSearch();
    this.setState({ didFirstSearch: true })
  }

  searchIsLongEnough = () => {
    const {chrom, position} = this.props;
    const pStr = position.toString().toLowerCase();
    return chrom !== "rsID"
      || (pStr.startsWith("rs") && pStr.length > 2)
      || !(pStr.startsWith("rs") && pStr.length);
  }

  debouncedFetch = debounce(start => {
    const {chrom} = this.props;
    if (this.searchIsLongEnough()) {
      if (this.state.source) {
        console.log("canceling stale autocomplete request")
        this.state.source.cancel("stale autocomplete request")
      }
      this.setState({source: axios.CancelToken.source()}, () => {
        this.props.fetchPositions({chrom, start}, undefined, this.state.source.token)
      })
    }
  }, 200, {leading: false, trailing: true})

  changePosition = pos => {
    this.props.setPosition(pos);
    this.debouncedFetch(pos);
  }

  onChange = (ev) => {
    this.changePosition(ev.target.value)
  }

  moveSelection = n => {
    const { length } = this.props.positions.list
    let index = this.state.index + n

    if (index < 0)
      index = index + length
    else if (index > length - 1)
      index = index % length

    this.setState({ index })
  }

  selectItem = index => {
    const { positions: { list }, navigate, chrom } = this.props
    const item = list[index]
    const position = item.nat_id ?? item.position ?? item.name
    // The item assay is the tab with the most significant result - which will be
    // selected first by nature of ordering, thus leading the user to the most interesting
    // detail from the autocomplete.
    navigate(`/locus/${chrom}/${position}/${item.assay}`, {replace: true})
    this.changePosition(position)
    this.props.doSearch();
  }

  renderChromName(chr) {
    return ["gene", "rsID"].includes(chr) ? chr : `chr${chr}`;
  }

  renderChroms() {
    const { chrom, chroms: { isLoading, list }, setChrom } = this.props

    return (
      <UncontrolledDropdown className='Controls__chromosome input-group-prepend'>
        <DropdownToggle caret disabled={isLoading}>
          { isLoading &&
            <span><Icon name='spinner' spin/> Loading</span>
          }
          {
            !isLoading &&
              (chrom ? this.renderChromName(chrom) : 'Chrom.')
          }
        </DropdownToggle>
        <DropdownMenu>
          {
            list.map(chr =>
              <DropdownItem key={chr} onClick={() => setChrom(chr)}>
                {this.renderChromName(chr)}</DropdownItem>
            )
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  renderPosition() {
    const { open, index } = this.state
    const { chrom, position, positions: { isLoading, list }, userData } = this.props

    return <>
      <Input
        className='Controls__input autocomplete'
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        value={position || ""}
        disabled={!userData.isLoaded || !userData.data?.consentedToTerms}
        placeholder={(chrom => {
          switch (chrom) {
            case 'rsID':
              return 'Search by RS ID'
            case 'gene':
              return 'Search RNA-seq results by gene name'
            default:
              return 'Search position'
          }
        })(chrom)}
      />
      {
        open &&
          <div className='autocomplete__dropdown-menu'>
            {
              list.length === 0 && <div className={ 'autocomplete__item autocomplete__item--empty' }>
                <span>{
                  this.searchIsLongEnough()
                    ? (isLoading ? "Loading..." : "No results")
                    : "Keep typing to see results"
                }</span>
              </div>
            }
            <div className={(list.length > 0 && isLoading) ? "loading" : ""}>
              {
                list.map((item, i) =>
                  <div
                    key={item.nat_id ?? item.position ?? item.name}
                    className={ 'autocomplete__item ' + (i === index ? 'autocomplete__item--selected' : '') }
                    onClick={() => this.selectItem(i)}
                  >
                    { highlight(item.nat_id ?? item.position ?? item.name, position) }
                    <span>
                      <strong>Min. <span style={{fontFamily: "serif"}}>p</span> value:</strong>
                      {' '}
                      {item.minValueMin.toExponential(2)}
                    </span>
                    <span><strong>Features:</strong> {item.nFeatures}</span>
                  </div>
                )
              }
            </div>
          </div>
      }
    </>;
  }

  render() {
    const { didFirstSearch } = this.state
    const { isLoading, userData } = this.props

    return (
      <div className={cx('Controls', { didFirstSearch })}>
        <div className='Controls__content'>
          <div style={{display: "flex", flexDirection: "row", width: "100%", maxWidth: "550px"}}>
            <InputGroup style={{flex: 1}}>
              { this.renderChroms() }
              { this.renderPosition() }
              <div className='input-group-append'>
                <Button className='Controls__search'
                  onClick={this.onClickSearch}
                  disabled={isLoading || !userData.isLoaded || !userData.data?.consentedToTerms}
                >
                  <Icon name={ isLoading ? 'spinner' : 'search' } spin={isLoading} /> Search
                </Button>
              </div>
            </InputGroup>
            <InputGroup style={{marginLeft: "8px"}}>
              <Button onClick={this.props.toggleHelp || (() => {})}>
                <Icon name="question-circle-o" /></Button>
            </InputGroup>
          </div>
          <div className='Controls__example'>
            e.g.: <b>chr11</b> <b>70310556</b> <em>Select chromosome first, then position</em>
          </div>
        </div>
      </div>
    )
  }
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
  const prefixLower = prefix.trimStart().toLowerCase();

  if (!textLower.startsWith(prefixLower)) {
    // Prefix isn't in search text, so don't render any highlighting.
    return <span>{text}</span>;
  }

  return <span>
    <span className="highlight">{text.substring(0, prefix.length)}</span>
    {text.substring(prefix.length)}
  </span>;
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controls);
