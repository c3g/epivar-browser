import React from 'react'


const Icon = ({ name, spin, className, bootstrap, ...rest }) => {
  const prefix = bootstrap ? "bi" : "fa";

  const iconClassName = [
    prefix,
    `${prefix}-${name}`,
    spin ? `${prefix}-spin` : '',
    className,
  ].join(' ')

  return <i className={iconClassName} {...rest} />
};

Icon.defaultProps = {
  bootstrap: false,
};

export default Icon;
