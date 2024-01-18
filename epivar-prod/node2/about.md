## About

**NOTE: This dataset contains data lifted over from hg19 to hg38, and as such, may not be perfectly mapped.**

Humans display remarkable immune response variation when exposed to identical immune challenges. For this project, we
carried out in-depth genetic, epigenetic, and transcriptional profiles on primary macrophages derived from a panel of
European and African-ancestry individuals, before and after infection with influenza A virus (IAV) (see below).

<div style="text-align: center;">
<img 
  src="https://flu-infection.vhost38.genap.ca/figure1A.png" 
  alt="Flu infection study visual flowchart" 
  width="1600" 
  height="1032" 
  style="width: 100%; height: auto; max-width: 800px;"
/>
</div>

The results of this project are summarized in 3 papers:

1. [Aracena et al. Epigenetic variation impacts ancestry-associated differences in the transcriptional response to influenza infection.](https://www.biorxiv.org/content/10.1101/2022.05.10.491413v1)
2. [Chen et al. Transposable elements are associated with the variable response to influenza infection.](https://doi.org/10.1016/j.xgen.2023.100292)
3. [Groza et al. Genome graphs detect human polymorphisms in active epigenomic state during influenza infection.](https://doi.org/10.1016/j.xgen.2023.100294)

All the datasets that have been generated as part of this project are summarized and
[made available here](#datasets). Access to some of the raw datasets require a formal data access request but all
resources are available freely. Please cite the appropriate paper(s) if you use the data.

We have also built a [browser tool](https://flu-infection.vhost38.genap.ca/about) that allows navigation of
these rich datasets by condition, ancestry and, importantly, haplotype. This allows an in-depth exploration of the
quantitative trait loci and other key results reported in the studies above. Using this tool requires a terms-of-use
agreement to ensure data privacy conditions are respected.


### Team

<div class="row">
<div class="col-sm-12 col-md-5 col-lg-6">

#### McGill University / Kyoto University

* Alain Pacis
* David Lougheed
* Albena Pramatarova
* Marie-Michelle Simon
* Xun Chen
* Cristian Groza
* Romain Grégoire
* David Brownlee
* Hanshi Liu
* Yann Joly
* David Bujold
* Tomi Pastinen
* Guillaume Bourque

</div>

<div class="col-sm-12 col-md-7 col-lg-6">

#### University of Chicago / Université de Montréal

* Katherine A Aracena
* Yen-Lung Lin
* Kaixuan Luo
* Saideep Gona
* Zepeng Mu
* Vania Yotova
* Renata Sindeaux
* Yang Li
* Xin He
* Luis B Barreiro

</div>
</div>


### Funding and Support

This work was supported by a Canada Institute of Health Research (CIHR) program grant (CEE-151618) for the McGill
Epigenomics Mapping Center, which is part of the Canadian Epigenetics, Environment and Health Research Consortium
(CEEHRC) Network. The work on EpiVar was also supported by a Genome Canada grant called EpiShare (Genome Canada - 15502)
and a Technology Platform grant for the Canadian Center for Computational Genomics (C3G). This project was also
supported by National Institute of Health Research grants R01-GM134376 and P30-DK042086 to L.B.B. GB is supported by a
Canada Research Chair Tier 1 award, a FRQ-S, Distinguished Research Scholar award and by the World Premier International
Research Center Initiative (WPI), NEXT, Japan. K.A.A. is supported by a grant to University of Chicago from the Howard
Hughes Medical Institute through the James H. Gilliam Fellowships for Advanced Study program.


## Datasets

All the datasets that have been generated as part of this project are made available freely. Access to some of the raw
datasets will require a formal data access request. Please cite [the appropriate paper(s)](#about) if you use data from
this project.


### Data Download

#### RNA-seq, ATAC-seq and ChIPmentation

Sequence data for RNA-seq, ATAC-seq and ChIPmentation have been deposited at the European Genome-phenome Archive (EGA),
under accession number [EGAD00001008422](https://ega-archive.org/datasets/EGAD00001008422).

#### WGS and WGBS

Sequence data for WGS and WGBS have been deposited at the European Genome-phenome Archive (EGA), under accession number
[EGAD00001008359](https://ega-archive.org/datasets/EGAD00001008359).

#### ChIP-seq and ATAC-seq on NA12878

Sequence data for ChIP-seq and ATAC-seq on NA12878 have been deposited at the Gene Expression Omnibus (GEO), under
access number [GSE225708](https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE225708).


### Data visualization

Genomic tracks by condition and ancestry are available [here](https://flu-infection.vhost38.genap.ca/explore).

We constructed [a versatile QTL browser](https://flu-infection.vhost38.genap.ca/dataset/overview), which allows users to
explore and visualize mapped QTLs for gene expression, chromatin accessibility, histone modifications and DNA
methylation.


## FAQ

<details open="">
<summary>How are the QTL plots generated?</summary>

Genome browser tracks were created with the HOMER *makeUCSCfile* command and *bedGraphToBigWig* utility from UCSC.
Tracks were normalized so that each value represents the read count per base pair per 10 million reads.
We generate [UCSC Genome Browser](https://genome.ucsc.edu/) track hubs upon request to visualize averaged track segments
for a given genomic feature. These tracks are created on the fly by averaging bigWig regions of samples sharing an
experimental treatment and genotype.

</details>

<details open="">
<summary>How were the global tracks per ancestry group generated?</summary>

The dark shaded area denotes the distribution of the average RPM values and the light shaded area denotes the standard
deviation. Signals of various epigenetic marks are shown in blue color for non-infected samples and red color for
infected samples. For RNA-seq, forward and reverse transcripts are shown in blue and green color separately for
non-infected samples; while forward and reverse transcripts are shown in red and brown color separately for infected
samples.

</details>
