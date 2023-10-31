import React, { useState, useEffect, useRef, createRef } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { ChevronDownIcon,  CopyIcon, EyeOpenIcon , InfoCircledIcon, Link2Icon, Share1Icon } from '@radix-ui/react-icons';
const iframecontentwindow = require("../scripts/iframeResizer.contentWindow.min.txt");

const Discover = () => {
  const [number, setNumber] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);

  const fetchInscriptions = async () => {
    console.log("Fetching")
    const response = await fetch(`/api/random_inscriptions?n=5`);
    const newInscriptions = await response.json();
    setInscriptions(inscriptions => [...inscriptions, ...newInscriptions])
    return newInscriptions;
  }

  const fetchInitial = async() => {
    //Start both calls at same time
    const genesis_promise = fetch(`/api/inscription_metadata_number/0`);
    const random_promise = fetch(`/api/random_inscriptions?n=5`);
    //Responses should arrive at similar times:
    const genesis_response = await genesis_promise;
    const random_response = await random_promise;
    const genesis_json = await genesis_response.json();
    const random_json = await random_response.json();
    //load both responses at same time to avoid lag after genesis/ out of order
    setInscriptions([genesis_json, ...random_json])
  }

  useEffect(() => {
    console.log("Initial fetch");
    fetchInitial();
  }, []);

  const observerTarget = useRef(null);
  const inscriptionReferences = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log("3 to go, prefetch");
          fetchInscriptions();
        }
      },
      { threshold: 1 }
    );

    
    if (inscriptionReferences.current[inscriptions.length-3]) {
      observer.observe(inscriptionReferences.current[inscriptions.length-3]);
    }

    return () => {
      if (inscriptionReferences.current[inscriptions.length-3]) {
        observer.unobserve(inscriptionReferences.current[inscriptions.length-3]);
      }
    }

  }, [inscriptions, inscriptionReferences])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && inscriptions.length !==0) {//Already prefetching on page load, no need to double prefetch
          console.log("last one, definitely prefetch");
          fetchInscriptions()
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    }
  }, [observerTarget]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(function() {
      console.log('Copying to clipboard was successful!');
    }, function(err) {
      console.error('Could not copy text: ', err);
    });
  }


  return (
    <PageContainer>
      {inscriptions.map((inscription, i, inscriptions) => (
        <ContentContainer key={i+1} id={i+1} ref={el => inscriptionReferences.current[i] = el}>
          <InscriptionContainer>
            {
              {
                'image/png': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                'image/jpeg': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                'image/webp': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                'image/gif': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                'image/avif': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                'image/svg+xml': <SvgContainer dangerouslySetInnerHTML={{__html: inscription.text}} />,
                'text/plain;charset=utf-8': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                'text/plain': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                'text/rtf': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                'application/json': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                'text/html;charset=utf-8': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ inscription.number} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer>,
                'text/html': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ inscription.number} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer>,
                'video/mp4': <VideoContainer controls loop muted autoPlay><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></VideoContainer>,
                'video/webm': <VideoContainer controls loop muted autoPlay><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></VideoContainer>,
                'audio/mpeg': <audio controls><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></audio>,
                'application/pdf': <TextContainer>pdf unsupported</TextContainer>,
                'model/gltf-binary': <TextContainer>gltf model type unsupported</TextContainer>,

                // to update
                'unsupported': <TextContainer>{metadata?.content_type} content type unsupported</TextContainer>,
                'loading': <TextContainer>loading...</TextContainer>
              }[inscription.content_type]
            }
          </InscriptionContainer>
          <InfoContainer>
            <NumberText>{inscription.number}</NumberText>
            {/* <MediaTextContainer>
              <MediaTypeText>{inscription.content_type}</MediaTypeText>
            </MediaTextContainer> */}
            <ButtonContainer>
              <a href={'/inscription/' + inscription.number} target='_blank'>
                <ActionButton>
                  <EyeOpenIcon color='#000' height='16px' width='16px' />
                </ActionButton>
              </a>
              <ActionButton onClick={() => {copyToClipboard(`https://vermilion.place/inscription/` + inscription.number)}}>
                <CopyIcon color='#000' height='16px' width='16px' />
              </ActionButton>
              {/* <ActionButton>
                <Share1Icon color='#000' height='16px' width='16px' />
              </ActionButton> */}
            </ButtonContainer>
          </InfoContainer>
        </ContentContainer>
      ))}
      <div ref={observerTarget}></div>
    </PageContainer>
    
  )
}

const PageContainer = styled.div`
  background-color: #FBFBFB;
  position: relative;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
  height: 100vh;
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const InscriptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;  
  width: 512px;
  max-width: 512px;
  height: 512px;
  max-height: 512px;
`;

const ImageContainer = styled.img`
  min-width: 16rem;
  max-width: 32rem;
  width: auto;
  height: auto;
  max-width: 512px;
  max-height: 512px;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
`;

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  min-width: 35rem;
  min-height: 35rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
`

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height:12rem;
  min-width:24rem;
  max-width:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
`;

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

const TextContainer = styled.div`
  width: auto;
  height: auto;
  max-width: 512px;
  max-height: 512px;
  padding: .75rem 1rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
`;

const InscriptionText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  // padding: 0 1rem;
`;

const NumberText = styled.p`
  font-family: ABC Camera Unlicensed Trial Medium Italic;
  font-size: 2em;
  margin: 0;
`;

const ContentContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  background-color: #FFF;
`;

const VideoContainer = styled.video`
  width: auto;
  height: auto;
  max-width: 512px;
  max-height: 512px;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
`;

const MediaTextContainer = styled.div`
  display: flex;
  padding: 2px 6px;
  justify-content: center;
  align-items: center;
  background: #EEE;
  border-radius: .125em;
  text-transform: uppercase;
`;

const MediaTypeText = styled.p`
  font-size: .875em;
  color: #858585;
  margin: 0;
`;

const ButtonContainer = styled.div`
  position: relative;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
`;

const ActionButton = styled.div`
  border: none;
  background-color: #EEE;
  padding: .75em;
  border-radius: 2rem;
  height: 16px;
  cursor: pointer;

  &:hover {
    background-color: #DDD;
  }
`;

export default Discover;