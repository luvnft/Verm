import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { renderToStaticMarkup } from 'react-dom/server';

import styled from 'styled-components';
import Gallery from '../components/Gallery';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import CheckIcon from '../assets/icons/CheckIcon';
import Stat from '../components/Stat';

import { formatSats } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';
import { formatTimestampSecs } from '../helpers/utils';

import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';

const Collection = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { symbol } = useParams();
  const [collectionSummary, setCollectionSummary] = useState(null);
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);

  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": [], "Satributes": [], "Charms":[]});

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      setInscriptionList([]);
      const response = await fetch("/api/inscriptions_in_collection/" + symbol);
      let json = await response.json();
      setInscriptionList(json);
    }
    fetchContent();
  },[symbol]);

  useEffect(() => {
    const fetchContent = async () => {
      const response = await fetch("/api/collection_summary/" + symbol);
      let json = await response.json();
      console.log(json);
      setCollectionSummary(json);
    }
    fetchContent();
  },[symbol]);

  //2. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_collection/" + symbol + "?sort_by=" + selectedSortOption;
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
      console.log("hit");
      query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
    }
    if (selectedFilterOptions["Satributes"] !== undefined && selectedFilterOptions["Satributes"].length > 0) {
      query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
    }
    if (selectedFilterOptions["Charms"] !== undefined && selectedFilterOptions["Charms"].length > 0) {
      query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
    }
    setBaseApi(query_string);
  },[symbol, selectedSortOption, selectedFilterOptions]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<BlockIcon svgSize={'2rem'} svgColor={'#E34234'} />)
  );

  const handleImageError = (event) => {
    console.log("error image triggered")
    event.target.onError = null;
    event.target.src = `data:image/svg+xml,${BlockIconDefault}`;
    //have to override default size of CollectionIcon
    event.target.style.width = "2.25rem"
    event.target.style.height = "2.25rem"
  };

  return (
    <MainContainer>
      <RowContainer>
        <Container style={{gap: '1rem'}}>
          <BlockImgContainer>
            {collectionSummary?.range_start ? 
              <InscriptionIcon endpoint = {"/api/inscription_number/" + collectionSummary?.range_start} useBlockIconDefault = {false}></InscriptionIcon> :
              <BlockIcon svgSize={'2.25rem'} svgColor={'#E34234'}></BlockIcon>
            }
          </BlockImgContainer>
          <BlockText>{collectionSummary?.name}</BlockText>
        </Container>
      </RowContainer>
      <RowContainer style={{gap: '1rem'}}>
        <InfoButton>
          <CheckIcon svgSize={'1rem'} svgColor={'#009859'} />
          {collectionSummary?.first_inscribed_date ? formatTimestampSecs(collectionSummary.first_inscribed_date) : ""}
        </InfoButton>
      </RowContainer>
      <RowContainer>
        <Container style={{gap: '2rem', flexFlow: 'wrap', justifyContent: 'center'}}>
          <Stat value={collectionSummary?.supply ? addCommas(collectionSummary?.supply) : 0} category={'Supply'} />
          {/* <Divider /> */}
          <Stat value={collectionSummary?.total_volume ? formatSats(collectionSummary.total_volume) : "0 BTC"} category={'Traded Volume'} />
          {/* <Divider /> */}
          <Stat value={collectionSummary?.range_start ? collectionSummary?.range_start + " to " + collectionSummary?.range_end : ""} category={'Range'} />
          {/* <Divider /> */}
          <Stat value={collectionSummary?.total_inscription_size ? shortenBytes(collectionSummary.total_inscription_size) : 0} category={'Total Size'} />
          {/* <Divider /> */}
          <Stat value={collectionSummary?.total_inscription_fees ? formatSats(collectionSummary.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
        </Container>
      </RowContainer>
      <SectionContainer>
        <TabButton isActive>Inscriptions</TabButton>
      </SectionContainer>
      <RowContainer>
        <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
          <FilterButton onClick={toggleFilterVisibility}>
            <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>
            Filters
          </FilterButton>
          <VisibilityButton onClick={toggleNumberVisibility}>
            <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
          </VisibilityButton>
        </Stack>
        <SortbyDropdown onOptionSelect={handleSortOptionChange} />
      </RowContainer>
      <RowContainer>
        <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
        <GalleryContainer>
          <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} />
        </GalleryContainer>
      </RowContainer>
    </MainContainer>
  )
}

const CollectionIcon = styled.img`
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 2rem;
`
  
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // flex: 1;
  align-items: start;
  // justify-content: center;
  margin: 0;

  @media (max-width: 768px) {
    
  }
`;

const MainContainer = styled.div`
  width: calc(100% - 3rem);
  padding: .5rem 1.5rem 2.5rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlockText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.5rem;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StatusWrapper = styled.div`
  display: flex;
  padding: .5rem 1rem;
  border-radius: .5rem;
  background-color: #EBFCF4;
`;

const StatusText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: .875rem;
  color: #009859;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: .875rem;
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1.5rem;
  border-bottom: 1px #E9E9E9 solid;
  // overflow: scroll;
`;

const ShareButton = styled.button`
  height: 36px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #FFFFFF;
  background-color: #000000;
`;

const TabButton = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; // Change text color based on isActive
  background-color: ${props => props.isActive ? '#F9E8E7' : '#FFFFFF'}; // Change background based on isActive
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.isActive ? '#F9E8E7' : '#F5F5F5'};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const VisibilityButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const FilterButton = styled.button`
  height: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Divider = styled.div`
  height: 1.5rem;
  border: 1px solid #E9E9E9;
`;

const InfoButton = styled.button`
  border-radius: 1.5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isButton ? 'pointer' : 'default'};
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;  
  background-color:#F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

export default Collection;