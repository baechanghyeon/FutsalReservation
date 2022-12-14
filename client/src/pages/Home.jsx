import React, { useEffect, useRef, useState } from 'react';
import { BiPhotoAlbum } from '@react-icons/all-files/bi/BiPhotoAlbum';
import { FaListUl } from '@react-icons/all-files/fa/FaListUl';
import styled, { keyframes } from 'styled-components';
import locationList from 'constants/locationList';
import { bannerList } from 'constants/imgList';
import SearchBar from 'components/organisms/SearchBar';
import LocationFilter from 'components/organisms/LocationFilter';
import GroundSlide from 'components/organisms/GroundSlide';
import GroundPhotoList from 'components/organisms/GroundPhotoList';
import GroundTextList from 'components/organisms/GroundTextList';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  groundListTypeState,
  locationState,
  pageState,
  searchInputState,
} from 'stores/groundStore';

const Home = () => {
  const [location, setLocation] = useRecoilState(locationState);
  const [searchInput, setSearchInput] = useRecoilState(searchInputState);
  const setPage = useSetRecoilState(pageState);

  // Toggle List Type
  const [listType, setListType] = useRecoilState(groundListTypeState);
  const handleListType = () => {
    if (listType === 'photo') {
      setListType('text');
    } else {
      setListType('photo');
    }
    setPage(1);
  };
  // Search
  const handleSearch = async (e) => {
    if (e.key === 'Enter') {
      setSearchInput(e.target.value);
      setPage(1);
    }
  };

  // Location Filter
  const [isOpenFilterModal, setisOpenFilterModal] = useState(false);
  const wrapperRef = useRef();

  const handleClickFilterModal = () => {
    if (!isOpenFilterModal) {
      setisOpenFilterModal(true);
    }
  };

  const getFilteredData = async (e) => {
    if (e.target.innerText === '모든 지역') setLocation('');
    else setLocation(e.target.innerText);
    setPage(1);
    setisOpenFilterModal(false);
  };

  const handleClickOutside = (event) => {
    if (wrapperRef && !wrapperRef.current?.contains(event.target)) {
      setisOpenFilterModal(false);
    } else {
      setisOpenFilterModal(true);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <>
      <GroundSlide info={bannerList} />
      <Container>
        <FilterWrapper>
          <LocationFilter
            ref={wrapperRef}
            value={isOpenFilterModal}
            filterName={location || '모든 지역'}
            handleClick={handleClickFilterModal}
          />
          {isOpenFilterModal && (
            <FilterModal ref={wrapperRef} value={isOpenFilterModal}>
              {locationList.map((districtName) => (
                <FilterButton
                  type='button'
                  key={districtName}
                  onClick={getFilteredData}
                >
                  {districtName}
                </FilterButton>
              ))}
            </FilterModal>
          )}
          <SearchBar placeholder='구장 찾기' onKeyDown={handleSearch} />
          <ListTypeButton>
            {listType === 'photo' ? (
              <FaListUl
                onClick={handleListType}
                disabled={listType === 'text'}
              />
            ) : (
              <BiPhotoAlbum
                onClick={handleListType}
                disabled={listType === 'photo'}
              />
            )}
          </ListTypeButton>
        </FilterWrapper>
        {listType === 'photo' ? (
          <GroundPhotoList location={location} searchInput={searchInput} />
        ) : (
          <GroundTextList location={location} searchInput={searchInput} />
        )}
      </Container>
    </>
  );
};

const Container = styled.div`
  padding: 1.5rem 10rem;
`;

const FilterWrapper = styled.div`
  position: relative;
  display: flex;
  margin: 0 1rem 0.5rem 1rem;
`;

const fadein = keyframes`
  from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

const FilterModal = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 15%;
  top: 3rem;
  padding: 1.5rem 1rem;
  background-color: #495057;
  border-radius: 4px;
  z-index: 9;
  animation: ${fadein} 0.5s;
  p {
    margin-bottom: 1rem;
  }
`;

const FilterButton = styled.button`
  width: 100%;
  padding: 4px 0;
  border-radius: 4px;
  color: #ffffff;
  font-size: 15px;
  & + & {
    margin-top: 0.5rem;
  }

  &:hover {
    background-color: #91a7ff;
  }
`;

const ListTypeButton = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  svg {
    width: 40px;
    height: 40px;
    font-size: 1.7rem;
    cursor: pointer;
    padding: 0.3rem;
    border: 1px solid #ced4da;
    border-radius: 4px;

    &:hover {
      color: #f06595;
    }
  }
`;

export default Home;
