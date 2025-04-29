# The EpiVar Browser

A federated web application to search for eQTL/epigenetic signal-associated variants and 
merge bigWig tracks by genotype. 

A production instance with data from 
[Aracena *et al.* (2024)](https://www.nature.com/articles/s41588-024-01668-z)
is available at 
[https://computationalgenomics.ca/tools/epivar](https://computationalgenomics.ca/tools/epivar). 

The tool itself is described in a 2024 application note:

> **EpiVar Browser: advanced exploration of epigenomics data under controlled access** <br />
> David R Lougheed, Hanshi Liu, Katherine A Aracena, Romain Grégoire, Alain Pacis, Tomi Pastinen, Luis B Barreiro, 
> Yann Joly, David Bujold, Guillaume Bourque<br />
> *Bioinformatics*; doi: [10.1093/bioinformatics/btae136](https://doi.org/10.1093/bioinformatics/btae136)



## Documentation

* [Setting up an EpiVar node](/docs/setting_up_a_node.md) 
* [Working with the EpiVar Browser production instance (for C3G employees)](/epivar-prod/README.md)
* [Developing EpiVar](/docs/development.md)
* [Old setup guide (deprecated)](/docs/old_setup_guide.md)

### Note on hosting your own node

The EpiVar Browser's server component can be deployed with other data than just
the Aracena *et al.* dataset. The instructions below must be followed,
paying especially close attention to the formats described the 
[node setup guide](/docs/setting_up_a_node.md).
