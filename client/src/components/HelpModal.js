import React from "react";

import {Modal, ModalBody, ModalHeader} from "reactstrap";

const HelpModal = ({isOpen, toggle}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>Help</ModalHeader>
    <ModalBody>
      <p>
        Start typing to see a list of SNPs (if searching by rsID) or a list of genes (if searching by gene).
        Results are ordered by the most significant <em>p</em>-value across flu-infected/non-infected samples and all
        six assays, and the top 50 SNPs/genes are shown. Click on a result to see the top peak, along with its
        corresponding signal box plot and a table of other peaks and assays to explore.
      </p>
      <p>
        Also available in the peak table are links to the UCSC genome browser with merged bigWig tracks of signal
        average/standard deviation, grouped by genotype, for a large window around the selected feature.
        The selected feature is highlighted in <strong>yellow</strong>, and the associated SNP is highlighted in{" "}
        <strong>red</strong>.
      </p>
    </ModalBody>
  </Modal>
);

export default HelpModal;
