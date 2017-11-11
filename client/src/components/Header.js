import React from 'react'
import { Container } from 'reactstrap'

export default function Header({ children }) {

  return (
    <div className='Header'>
      <Container>
        <h1 className='Header__title'>VARWIG</h1>
        <h4 className='Header__subtitle'>Variant search & merge tool</h4>
        { children }
      </Container>
    </div>
  )
}
