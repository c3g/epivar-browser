import React, {useState} from "react";

import {Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

const TermsModal = ({isOpen, toggle, showAgree, onAgree}) => {
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [institution, setInstitution] = useState("");
  
  const canSubmit = agreeChecked && institution.trim() !== "";

  return (
    <Modal isOpen={isOpen} toggle={toggle} style={{maxWidth: 720}}>
      <ModalHeader toggle={toggle}>EpiVar Browser website terms of use</ModalHeader>
      <ModalBody>
        <div>
          <p>
            In proceeding to the EpiVar Browser you are agreeing to the following terms of use:
          </p>
          <h3>Data Confidentiality</h3>
          <ol>
            <li>
              You agree that the information you have provided for the purposes of accessing and using the EpiVar Brower 
              are true to the best of your knowledge.
            </li>
            <li>
              You agree not to attempt to re-identify Research Participants. This includes trying to link the Data 
              provided through the EpiVar Browser to other sources of information or available archive data, even if 
              access to that data has been formally granted to you, or it is freely available without restriction, 
              without specific permission being sought from the EpiVar Browser.
            </li>
            <li>
              You agree to protect the confidentiality of Research Participants in any research papers or publications 
              that they prepare by taking all reasonable care to limit the possibility of identification.
            </li>
            <li>
              You agree to contact the EpiVar Browser at{" "}
              <a href="mailto:epivar@computationalgenomics.ca">epivar@computationalgenomics.ca</a>. within 10 days if 
              you detect any personally identifiable research data on the EpiVar Browser. Personally identifiable data 
              is defined as information that can reasonably be used to identify an individual either alone or in 
              combination with other available information.
            </li>
          </ol>
          <h3>Website Privacy policy</h3>
          <p>
            The EpiVar Browser is committed to protecting the privacy and security of the personal information and data 
            of its users to the greatest extent possible subject to Canada’s provincial/territorial and federal laws. 
            Personal information is defined as information that can reasonably be used to identify an individual either 
            alone or in combination with other available information. The EpiVar Browser will only use your personal 
            information for specific and consented purposes. This policy will be maintained except in circumstances 
            required by law to provide access, or in response to subpoenas or other legal instruments to authorize 
            access to personal information. Except for these scenarios, personal information will not be shared outside 
            of The EpiVar Browser and its associated personnel or contractors without your explicit consent. When 
            collected, personal information will only be retained for as long as necessary to fulfil its purposes 
            subject to the applicable Canadian legal requirements.
          </p>
          <h4>Purpose, use, and collection of information</h4>
          <p>
            The purpose of the EpiVar Browser is to facilitate scientific research by providing researchers and other 
            interested parties access to epigenetic signal data, genetic data, and certain associated contextual 
            metadata.
          </p>
          <p>
            Personal information is not required to view this website, although certain key features will require some 
            personal information to function optimally. We may collect this personal information in the form of webforms 
            in connection with your account and services provided to you. The level of information collected will also 
            be subject to the type of services and account used. Providing us with your information where required is 
            strictly voluntary. Any personal information collected will be appropriately protected through physical and 
            electronic means such as user authentication, and other data security practices.
          </p>
          <p>
            By providing your personal information, you are consenting to its use for the purposes listed below:
          </p>
          <ul>
            <li>
              Communicate with you regarding our services such as an event notification, a change of policy, or to 
              follow-up regarding the terms and conditions of the EpiVar Browser,
            </li>
            <li>
              Provide you with a service (e.g., help data access),
            </li>
            <li>
              Communicate and troubleshoot with you regarding any The EpiVar Browser website functionalities and or 
              services.
            </li>
          </ul>
          <p>
            The EpiVar Browser website and its associated servers also collect the following analytics for the purposes 
            of web presentation, troubleshooting, and web functionality. This information will not be associated with 
            individual user identities, and will not be used to re-identify any users as subject to this privacy policy:
          </p>
          <ul>
            <li>Internet Protocol (IP) address of the computer being used,</li>
            <li>Web pages requested,</li>
            <li>Referring web page,</li>
            <li>Browser used,</li>
            <li>Date and time of activities.</li>
          </ul>
          <h4>Distribution of information to third parties</h4>
          <p>
            Third-party contractors and or agents may be involved in maintaining and improving the functions 
            (e.g., IT services) of the EpiVar Browser Website. In these scenarios, if any associated third party should 
            be provided access to any personal information, personal information will be kept secure, private, and
            confidential in accordance with Canadian Provincial/territorial and Federal legislation, and that of the 
            EpiVar Browser Privacy Policy. Such parties are only permitted to use such personal information for lawful 
            purposes authorized by the EpiVar Browser.
          </p>
          <h4>Cookies</h4>
          <p>
            This website uses ‘Cookies’. Cookies may collect information such as your email address, username, or keep 
            track of pages visited and documents downloaded. The EpiVar Browser may use ‘cookies’ to deliver web content 
            specific to a user’s interests or to keep users logged in when such a feature is enabled. You may choose to 
            enable or disable cookies on this website, and such information will not be collected. Disabling cookies 
            will not restrict your access to the EpiVar Browser website but may affect the normal functioning of various 
            features.
          </p>
          <h4>Hyperlinks and other privacy policies</h4>
          <p>
            If you follow a hyperlink from the EpiVar Browser website onto the website(s) of another entity, that entity 
            may have/uphold a different privacy policy. EpiVar Browser bears no responsibility for the privacy of the 
            user in such a scenario, and we advise you to appropriately consult the privacy policies of these other 
            entities.
          </p>
          <h4>Right to be “forgotten”</h4>
          <p>
            Users may request the erasure/deletion of any personal information they have provided to the EpiVar Browser 
            website. If possible, the EpiVar Browser website will work to promptly erase/delete this personal 
            information, except for where required by law (e.g., for records for auditing records). To request the 
            erasure/deletion of your personal information, you may contact us at{" "}
            <a href="mailto:epivar@computationalgenomics.ca">epivar@computationalgenomics.ca</a>.
          </p>
          <h4>Privacy policy revisions</h4>
          <p>
            This privacy policy was last revised on May 9th, 2022, These policies are subject to change, and we 
            encourage you to review this Privacy Policy each time you visit the website. If any significant changes are 
            made to this policy, a notice will be posted on the homepage for a reasonable period of time after the 
            change is implemented, so that the user may be fully aware of any changes before using the EpiVar Browser 
            website.
          </p>
        </div>
      </ModalBody>
      {showAgree && (
        <ModalFooter>
          <Form inline={true}>
            <FormGroup check={true} style={{marginRight: 16}}>
              <Input id="terms-checkbox" type="checkbox" onChange={e => setAgreeChecked(e.target.checked)} />
              {" "}
              <Label check={true} for="terms-checkbox">
                I agree to these terms
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="terms-institution" style={{marginRight: "0.5em"}}>
                Institution:
              </Label>
              <Input id="terms-institution" 
                     placeholder="Enter your institution" 
                     value={institution} 
                     onChange={e => setInstitution(e.target.value)} />
            </FormGroup>
          </Form>
          <div style={{flex: 1}} />
          <Button 
            color="primary" 
            disabled={!canSubmit} 
            style={{cursor: canSubmit ? "pointer" : "not-allowed"}}
            onClick={() => {
              if (canSubmit) onAgree(institution);
            }}>Agree</Button>
          {" "}
          <Button onClick={toggle}>Cancel</Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default TermsModal;
