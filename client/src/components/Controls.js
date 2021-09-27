import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
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
  changePosition,
  fetchSamples,
  fetchPositions,
  mergeTracks,
  handleError,
} from '../actions.js'

const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.list
  , chroms: state.chroms
  , chrom: state.ui.chrom
  , windowStart: state.ui.windowStart
  , windowEnd: state.ui.windowEnd
  , positions: state.positions
  , position: state.ui.position
  , range: state.ui.range
})
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({
    setChrom,
    doSearch,
    changePosition,
    fetchSamples,
    fetchPositions,
    mergeTracks,
    handleError
  }, dispatch)

class Controls extends React.Component {

  state = {
    index: 0,
    open: false,
    didFirstSearch: false,
    searchPosition: "",
  }

  componentDidMount() {
    const { params: {chrom, position} } = this.props;
    if (chrom && position) {
      this.props.doSearch(chrom, position);
    }
  }

  componentWillReceiveProps(props) {
    if (props.params?.chrom !== this.props.params?.chrom) {
      const { params: {chrom} } = props;

      this.props.fetchPositions({ chrom, position: '' })
    }
    if (props.positions !== this.props.positions) {
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
        const {params: {chrom, position}} = this.props;
        this.props.doSearch(chrom, position);
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
    const {params: {chrom, position}} = this.props;
    const {searchPosition} = this.state;
    this.props.doSearch(chrom, searchPosition || position);
    this.setState({ didFirstSearch: true })
  }

  onChange = (ev) => {
    const {params: {chrom}} = this.props;
    const searchPosition = ev.target.value;
    this.setState({searchPosition});
    this.props.fetchPositions({chrom, start: searchPosition});
    // this.props.changePosition(ev.target.value)
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
    const { positions: { list }, params: {chrom}, history } = this.props

    const position = list[index]
    history.replace(`/${chrom}/${position}`);
    this.props.doSearch(chrom, position);
    this.setState({searchPosition: ""});  // Search has been fulfilled; clear the override
  }

  renderChroms() {
    const { chroms: { isLoading, list }, params: {chrom}, history } = this.props

    return (
      <UncontrolledDropdown className='Controls__chromosome input-group-prepend'>
        <DropdownToggle caret disabled={isLoading}>
          { isLoading &&
            <span><Icon name='spinner' spin/> Loading</span>
          }
          {
            !isLoading &&
              (chrom || 'Chrom.')
          }
        </DropdownToggle>
        <DropdownMenu>
          {
            list.map(chrom =>
              <DropdownItem key={chrom} onClick={() => history.replace(`/${chrom}`)}>{ chrom }</DropdownItem>
            )
          }
        </DropdownMenu>
      </UncontrolledDropdown>
    )
  }

  renderPosition() {
    const { open, index, searchPosition } = this.state
    const { positions: { list }, params: {chrom, position} } = this.props

    return (
      <>
        <Input
          className='Controls__input autocomplete'
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          value={searchPosition || position || ""}
          placeholder={chrom === 'rsID' ? 'Search by RS ID' : 'Search position'}
        />
        {
          open &&
            <div className='autocomplete__dropdown-menu'>
              {
                list.length === 0 &&
                  <div className={ 'autocomplete__item autocomplete__item--empty' }>
                    <span>No results</span>
                  </div>
              }
              {
                list.map((item, i) =>
                  <div key={item} className={ 'autocomplete__item ' + (i === index ? 'autocomplete__item--selected' : '') }
                    onClick={() => this.selectItem(i)}
                  >
                    { highlight(item, position) }
                  </div>
                )
              }
            </div>
        }
      </>
    )
  }

  render() {
    const { didFirstSearch } = this.state
    const { isLoading } = this.props

    return (
      <div className={cx('Controls', { didFirstSearch })}>
        <div className='Controls__content'>
          <InputGroup>
            { this.renderChroms() }
            { this.renderPosition() }
            <div className='input-group-append'>
              <Button className='Controls__search'
                onClick={this.onClickSearch}
                disabled={isLoading}
              >
                <Icon name={ isLoading ? 'spinner' : 'search' } spin={isLoading} /> Search
              </Button>
            </div>
          </InputGroup>
          <div className='Controls__example'>
            e.g.: <b>chr11</b> <b>70310556</b> <em>Select chromosome first, then position</em>
          </div>
        </div>
      </div>
    )
  }
}

function highlight(item, prefix) {
  const text = String(item)
  if (!text.startsWith(prefix))
    return <span>{ text }</span>

  const rest = text.replace(prefix, '')
  return (
    <span>
      <span className='highlight'>{ prefix }</span>
      { rest }
    </span>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Controls);
