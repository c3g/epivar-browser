import React, {Component, useEffect, useState} from 'react';
import {Navigate, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";

import "bootstrap-icons/font/bootstrap-icons.min.css";

import Header from './Header'
import Footer from './Footer'
import PeakResults from './PeakResults'
import HelpModal from "./HelpModal";
import TermsModal from "./TermsModal";

import {ETHNICITY_BOX_COLOR} from "../constants/app";
import {saveUser} from "../actions";
import ContactModal from "./ContactModal";
import AboutPage from "./pages/AboutPage";
import ProtectedPageContainer from "./pages/ProtectedPageContainer";
import ExplorePage from "./pages/ExplorePage";
import DatasetsPage from "./pages/DatasetsPage";
import FAQPage from "./pages/FAQPage";
import ManhattanTest from "./ManhattanTest";


const RoutedApp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const userData = useSelector(state => state.user);

  const [helpModal, setHelpModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [termsModal, setTermsModal] = useState(false);

  const chrom = useSelector(state => state.ui.chrom);
  const position = useSelector(state => state.ui.position);

  const toggleHelp = () => setHelpModal(!helpModal);
  const toggleContact = () => setContactModal(!contactModal);
  const toggleTerms = () => setTermsModal(!termsModal);

  const navigateAbout = () => navigate("/about");
  const navigateDatasets = () => navigate("/datasets");
  const navigateOverview = () => navigate("/overview");  // TODO: remember chrom and assay
  const navigateExplore = () => {
    if (location.pathname.startsWith("/explore")) return;
    if (chrom && position) {
      navigate(`/explore/locus/${chrom}/${position}`);
    } else {
      navigate("/explore");
    }
  }
  const navigateFAQ = () => navigate("/faq");

  useEffect(() => {
    if (userData.isLoaded && userData.data && !userData.data.consentedToTerms) {
      // If the user has signed in and has not yet consented to the current terms version,
      // show the terms modal.
      setTermsModal(true);
    } else if (userData.data?.consentedToTerms) {
      // Just consented, close the modal
      setTermsModal(false);
    }
  }, [userData]);

  return (
    <div className="RoutedApp">
      <TermsModal
        isOpen={termsModal}
        toggle={toggleTerms}
        showAgree={userData.data && !userData.data.consentedToTerms}
        onAgree={institution => {
          if (userData.isLoaded) {
            dispatch(saveUser({consentedToTerms: true, institution}));
          }
        }}
      />

      <ContactModal isOpen={contactModal} toggle={toggleContact} />

      <Header onAbout={navigateAbout}
              onDatasets={navigateDatasets}
              onOverview={navigateOverview}
              onExplore={navigateExplore}
              onFAQ={navigateFAQ}
              onContact={toggleContact}>
        <HelpModal isOpen={helpModal} toggle={toggleHelp} />
      </Header>

      <Outlet context={{termsModal, setTermsModal, toggleHelp}} />

      <Footer onContact={toggleContact} onTerms={toggleTerms} />
    </div>
  )
};


class App extends Component {
  render() {
    return (
      <div className='App'>
        <svg height={0} style={{position: "absolute"}}>
          <pattern id="diagonal" patternUnits="userSpaceOnUse" width={9} height={9} patternTransform="rotate(45 0 0)">
            <rect x={0} y={0} width={9} height={9} fill="#FFFFFF" />
            <line x1={3} y1={0} x2={3} y2={9} style={{
              stroke: ETHNICITY_BOX_COLOR.AF,
              strokeWidth: 6,
            }} />
            <line x1={7.5} y1={0} x2={7.5} y2={9} style={{
              stroke: ETHNICITY_BOX_COLOR.EU,
              strokeWidth: 3,
            }} />
          </pattern>
        </svg>

        <Routes>
          <Route path="/" element={<RoutedApp />}>
            <Route index={true} element={<Navigate to="/about" replace={true} />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="datasets" element={<DatasetsPage />} />
            <Route path="overview" element={<ProtectedPageContainer>
              <ManhattanTest />
            </ProtectedPageContainer>} />
            <Route path="explore" element={<ProtectedPageContainer>
              <ExplorePage />
            </ProtectedPageContainer>}>
              <Route index={true} element={<PeakResults />} />
              <Route path="locus/:chrom/:position/:assay" element={<PeakResults />} />
              <Route path="locus/:chrom/:position" element={<PeakResults />} />
              <Route path="manhattan" element={<ManhattanTest />} />
            </Route>
            <Route path="faq" element={<FAQPage />} />
            <Route path="auth-failure" element={<div />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />}/>
        </Routes>
      </div>
    )
  }
}


export default App;
