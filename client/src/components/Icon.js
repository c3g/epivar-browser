import React from 'react'


export default function Icon(props) {
  const className = [
    'fa',
    `fa-${props.name}`,
    ('spin' in props) && (props.spin !== false) ? 'fa-spin' : ''
  ].join(' ')

  return <i className={className} />
}
