import React from 'react'
import { Container } from 'reactstrap'
import {Link, useHistory} from "react-router-dom";

export default function Header({ children }) {
  const history = useHistory();

  return (
    <div className='Header'>
      <Container>
        <h1 className='Header__title'><Link to="/" className='Link'>IMMUNPOP</Link></h1>
        <h4 className='Header__subtitle'>Epigenetic & Expression QTLs</h4>
        { children }
      </Container>
    </div>
  )
}
