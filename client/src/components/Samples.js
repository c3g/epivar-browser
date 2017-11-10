/*
 * Samples.js
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    BootstrapTable as Table
  , TableHeaderColumn as Header
} from 'react-bootstrap-table';
import { Row, Col, Popover, PopoverHeader, PopoverBody } from 'reactstrap';
import cx from 'classname';

import humanReadableTime from '../helpers/humanReadableTime.js';

const { values } = Object



const Span = ({ children }) => (
  <span title={children}>
    { children }
  </span>
)


const mapStateToProps = state => ({
  isLoading: state.samples.isLoading
})
const mapDispatchToProps = dispatch => ({
})
class Samples extends Component {
  constructor() {
    super()

    this.renderSteps = this.renderSteps.bind(this)
    this.togglePopover = this.togglePopover.bind(this)

    this.stepsToScrollIntoView = {}

    this.state = {
      popoverOpen: false,
      popoverTarget: document.body,
      popoverData: undefined
    }
  }

  componentWillReceiveProps(newProps) {
    if (newProps.samples !== this.props.samples)
      this.stepsToScrollIntoView = {}
  }

  componentDidUpdate() {
    // We scroll into view the step-in-progress, but only once.
    // When step === true, it means we have already scrolled it once
    Object.entries(this.stepsToScrollIntoView).forEach(([ id, step ]) => {
      if (step === true || step === null)
        return
      const scrollArea = step.parentElement
      const scrollBox = scrollArea.getBoundingClientRect()
      scrollArea.scrollLeft = step.offsetLeft - scrollBox.left - scrollBox.width / 2
      this.stepsToScrollIntoView[id] = true
    })
  }

  openPopover(target, step) {
    this.setState({
      popoverOpen: true,
      popoverTarget: target,
      popoverData: step
    })
  }

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    })
  }

  render() {

    const { samples } = this.props

    return (
      <div className='Samples'>
        {
          samples.length === 0 &&
            <div className='Samples__empty text-message'>
              No samples to display. Try removing some filters.
            </div>
        }

        {
          samples.map(sample => {

            const generalInformation = sample.data.pipeline.general_information
            const pipelineName = sample.data.pipeline.name

            return (
              <div key={sample.id} className='Sample'>
                <div className='Sample__details box'>
                  <div className='box__header'>{ sample.id } ({ sample.user + ')' }
                    <span className='box__badge'>
                      ({ humanReadableTime(sample.modified) + ')' }
                    </span>
                  </div>
                  <div className='box__body'>

                    <div className='Sample__table'>
                      <div className='d-flex'>
                        <span className='th'>Pipeline</span>
                        <Span>{ pipelineName } { generalInformation.pipeline_version }</Span>
                        <span className='th'>Assembly</span>
                        <Span>{ generalInformation.assembly_used } ({ generalInformation.assembly_source  + ')'}</Span>
                      </div>
                      <div className='d-flex'>
                        <span className='th'>HPC Center</span>
                        <Span>{ generalInformation.hpc_center }</Span>
                        <span className='th'>DBSNP</span>
                        <Span>{ generalInformation.dbsnp_version }</Span>
                      </div>
                      <div className='d-flex'>
                        <span className='th'>Species</span>
                        <Span>{ generalInformation.analysed_species }</Span>
                        <span className='th'>Folder</span>
                        <Span colSpan='3'>{ generalInformation.analysis_folder }</Span>
                      </div>
                    </div>

                  </div>
                </div>
                { this.renderSteps(sample) }
              </div>
            )
          })
        }

        { this.renderPopover() }
      </div>
    )
  }

  renderPopover() {
    const { popoverOpen, popoverTarget, popoverData } = this.state

    if (!popoverData)
      return undefined

    const generalInformation = popoverData.sample.data.pipeline.general_information
    const step = popoverData.step
    const name = step.name
    const jobs = step.job

    return <Popover key={popoverTarget}
      placement='bottom'
      isOpen={popoverOpen}
      target={popoverTarget}
      toggle={this.togglePopover}
    >
      <PopoverHeader>Jobs for { name }</PopoverHeader>
      <PopoverBody>
        <div className='Popover__scrollArea'>
          <div class='list-group'>
            {
              jobs.map(job =>
                <div key={job.id} class='list-group-item flex-column align-items-start'>
                  <div class='d-flex w-100 justify-content-between'>
                    <h6 class='mb-1'>{ job.id }</h6>
                    <small>{ job.job_start_date || '' } - { job.job_end_date || '' }</small>
                  </div>
                  <p class='mb-1 job__command'>
                    { job.command.split('&&').map((cmd, i) => <span>{ (i ? '&&' : '   ') + cmd }<br/></span>) } 
                  </p>
                  <small>Status: { job.status }</small>
                </div>
              )
            }
          </div>
        </div>
      </PopoverBody>
    </Popover>
  }

  renderSteps(sample) {
    if (!sample || !sample.data)
      return <em>No steps</em>

    const steps = sample.data.pipeline.step

    return <div className='Sample__steps steps'>
      {
        steps.map((step, i) => {
          const id = ['step', sample.id, i].join('__')

          const jobs = step.job
          const name = step.name
          const endDate = getLastEndDate(jobs)

          const isDone = jobs.every(hasEnded)
          const inProgress = jobs.some(isRunning)
          const notStarted = !inProgress && jobs.every(job => job.job_end_date === undefined)

          const className = cx(
              'step',
            { 'step--success': jobs.every(job => job.status === 'success') },
            { 'step--warning': jobs.some(job => job.status === 'warning') },
            { 'step--error':   jobs.some(job => job.status === 'error') },
            { 'step--in-progress': inProgress },
            { 'step--not-started': notStarted },
            { 'step--active': this.state.popoverOpen && id === this.state.popoverTarget },
          )

          // We need to scroll to the last done/in-progress job, thus we attach a ref
          const onRef = !(inProgress || isDone) ? undefined : ref => {
            if (this.stepsToScrollIntoView[sample.id] !== true)
              this.stepsToScrollIntoView[sample.id] = ref
          }

          const openPopover = () =>
            this.openPopover(id, { step, sample })

          return <div id={id} className={className} onClick={openPopover} ref={onRef}>
            <div className='step__dot' />
            <div className='step__name' title={name}>{name}</div>
            <div className='step__details text-message'>
              { endDate }
            </div>
          </div>
        })
      }
    </div>
  }

}

function isRunning(job) {
  return ('job_start_date' in job) && !('job_end_date' in job)
}

function hasEnded(job) {
  return 'job_end_date' in job
}

function getLastEndDate(jobs) {
  const result = jobs.reduce((acc, job) => {
    if (!job.job_end_date)
      return acc
    const d = new Date(job.job_end_date)
    if (d > acc)
      return d
    return acc
  }, 0)
  return result === 0 ? undefined : result.toLocaleString()
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Samples);
