import React from "react";
import {useSelector} from "react-redux";
import {useOutletContext} from "react-router-dom";
import {LOGIN_PATH} from "../../constants/app";
import Intro from "../Intro";
import {Container, Spinner} from "reactstrap";

const ProtectedPageContainer = ({children}) => {
  const {setTermsModal} = useOutletContext();
  const userData = useSelector(state => state.user);

  if (!userData.isLoaded) return <Container>
    <div style={{textAlign: "center", marginTop: 48}}>
      <Spinner />
    </div>
  </Container>;

  return (!userData.data?.consentedToTerms) ? (
    <Intro onTerms={() => setTermsModal(true)} onAccess={() => {
      if (!userData.data) {
        // Redirect to sign in, so we can capture some information about their identity
        window.location.href = `${LOGIN_PATH}?redirect=${window.location.pathname}`;
      } else {
        // Signed in but terms not accepted yet; show the modal.
        setTermsModal(true);
      }
    }} signedIn={!!userData.data} />
  ) : <>
    {children}
  </>;
};

export default ProtectedPageContainer;
