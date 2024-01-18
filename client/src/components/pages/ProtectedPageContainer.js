import React, {useCallback, useEffect} from "react";
import {useSelector} from "react-redux";
import {useOutletContext} from "react-router-dom";
import {Container, Spinner} from "reactstrap";

import {getHasLoggedIn, setHasLoggedIn} from "../../helpers/localStorage";
import {useNode} from "../../hooks";

import Intro from "../Intro";

const LoadingContainer = React.memo(() => (
  <Container>
    <div style={{textAlign: "center", marginTop: 48}}>
      <Spinner />
    </div>
  </Container>
));

const ProtectedPageContainer = React.memo(({children}) => {
  const node = useNode();
  const {setTermsModal} = useOutletContext();
  const {data: userData, isLoaded} = useSelector(state => state.user);

  const triggerLogIn = useCallback(() => {
    if (!node) {
      console.warn("no node selected; cannot trigger log in");
      return;
    }
    window.location.href = `${node}/api/auth/login?redirect=${window.location.href}`;
  }, [node]);

  useEffect(() => {
    if (!node) return;
    if (isLoaded && userData) {
      setHasLoggedIn(node);
    } else if (isLoaded && !userData) {
      if (getHasLoggedIn(node)) {
        console.info("triggering log-in (has logged in before)");
        triggerLogIn();
      }
    }
  }, [node, isLoaded, userData]);

  const onAccess = useCallback(() => {
    if (!userData) {
      // Redirect to sign in, so we can capture some information about their identity (IP address).
      console.info("triggering log-in (onAccess)");
      triggerLogIn();
    } else {
      // Signed in but terms not accepted yet; show the modal.
      setTermsModal(true);
    }
  }, [userData]);

  if (!isLoaded) return <LoadingContainer />;

  return (!userData?.consentedToTerms) ? (
    <Intro onAccess={onAccess} />
  ) : <>
    {children}
  </>;
});

export default ProtectedPageContainer;
