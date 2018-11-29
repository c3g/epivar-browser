import React from 'react'


export default function Icon({ name, spin, className, ...rest }) {
  const iconClassName = [
    'fa',
    `fa-${name}`,
    spin ? 'fa-spin' : '',
    className,
  ].join(' ')

  return <i className={iconClassName} {...rest} />
}
