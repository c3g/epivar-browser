import React from 'react'
import { Container } from 'reactstrap'

export default function Header({ children }) {

  return (
    <div className='Header'>
      <Container>
        <h1 className='Header__title'>IMMUNPOP</h1>
        <h4 className='Header__subtitle'>Epigenetic & Expression QTLs</h4>
        { children }
      </Container>
    </div>
  )
}
