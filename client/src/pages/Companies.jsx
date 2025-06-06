//Companies.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CompanyCard, CustomButton, Header, ListBox , Loading} from "../components";
import { apiRequest, updateURL } from "../utils";


const Companies = () => {
  const [page, setPage] = useState(1);
  const [numPage, setNumPage] = useState(1);
  const [recordsCount, setRecordsCount] = useState(0);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cmpLocation, setCmpLocation] = useState("");
  const [sort, setSort] = useState("Newest");
  const [isFetching, setIsFetching] = useState(false);


  const location = useLocation();
  const navigate = useNavigate();

  const fetchCompanies = async() => {
    setIsFetching(true);
    const newURL = updateURL({
      pageNumber: page,
      query: searchQuery,
      cmpLoc: cmpLocation,
      sort: sort,
      navigate: navigate,
      location: location,
    });

    try {
      const res = await apiRequest({
        url: newURL,
        method: "GET"
      });

       
        setData(res?.data);
        setNumPage(res?.numOfPage);
        setRecordsCount(res?.total);
      
    } catch(error) {
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, sort, cmpLocation]);

  return (
    <div className='w-full'>
      <Header
        title='Find Your Dream Company'
        handleClick={(e) => {
          e.preventDefault();
          fetchCompanies();
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        location={cmpLocation}
        setLocation={setCmpLocation}
      />

      <div className='container mx-auto flex flex-col gap-5 2xl:gap-10 px-5 py-6 bg-[#f7fdfd]'>
        <div className='flex items-center justify-between'>
          <p className='text-sm md:text-base'>
            Showing: <span className='font-semibold'>{recordsCount}</span> Companies
          </p>

          <div className='flex flex-col md:flex-row gap-0 md:gap-2 md:items-center'>
            <p className='text-sm md:text-base'>Sort By:</p>
            <ListBox sort={sort} setSort={setSort} />
          </div>
        </div>

        <div className='w-full flex flex-col gap-6'>
          {isFetching ? (
            <Loading />
          ) : (
            data?.map((company, index) => (
              <CompanyCard key={index} cmp={company} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Companies;