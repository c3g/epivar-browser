import React, {useCallback} from "react";
import {useSelector} from "react-redux";
import {useOutletContext} from "react-router-dom";
import {LOGIN_PATH} from "../../constants/app";
import Intro from "../Intro";
import {Container, Spinner} from "reactstrap";
import {setPostAuthPath} from "../../helpers/localStorage";

const LoadingContainer = React.memo(() => (
  <Container>
    <div style={{textAlign: "center", marginTop: 48}}>
      <Spinner />
    </div>
  </Container>
));

const ProtectedPageContainer = React.memo(({children}) => {
  const {setTermsModal} = useOutletContext();
  const {data: userData, isLoaded} = useSelector(state => state.user);

  const onTerms = useCallback(() => setTermsModal(true), []);
  const onAccess = useCallback(() => {
    if (!userData) {
      // Set our post-auth redirect and redirect to sign in, so we can capture some information about their identity.
      setPostAuthPath(window.location.pathname);
      window.location.href = `${LOGIN_PATH}?redirect=${window.location.pathname}`;
    } else {
      // Signed in but terms not accepted yet; show the modal.
      setTermsModal(true);
    }
  }, [userData]);

  if (!isLoaded) return <LoadingContainer />;

  return (!userData?.consentedToTerms) ? (
    <Intro onTerms={onTerms} onAccess={onAccess} signedIn={!!userData} />
  ) : <>
    {children}
  </>;
});

export default ProtectedPageContainer;
