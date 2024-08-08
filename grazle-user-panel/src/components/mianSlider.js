import React, { useEffect, useState } from "react";
import Image from "next/image";
import Carousel from "react-multi-carousel";
import {getBannersApi} from '@/apis'
import "react-multi-carousel/lib/styles.css";

const responsive = {
  lgdesktop: {
    breakpoint: { max: 3000, min: 1441 },
    items: 1,
    slidesToSlide: 1,
  },
  desktop: {
    breakpoint: { max: 1440, min: 1041 },
    items: 1,
    slidesToSlide: 1,
  },
  Laptop: {
    breakpoint: { max: 1040, min: 769 },
    items: 1,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 768, min: 481 },
    items: 1,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 480, min: 320 },
    items: 1,
    slidesToSlide: 1,
  },
};


const MainSlider = () => {
  const [banners, setBanners] = useState([]);
  const [screen, setScreen] = useState("web");
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        setScreen("mobile");
      } else {
        setScreen("web");
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        let allBanners = [];
        for (let i = 1; i <= 5; i++) {
          const response = await getBannersApi(i,screen);
          allBanners = [...allBanners, ...response.data.banners];
        }
        setBanners(allBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);
  
  return (
    <div className="parent">
      <Carousel
        responsive={responsive}
        swipeable={true}
        draggable={true}
        showDots={false}
        infinite={true}
        dotListClass="custom-dot-list-style"
      >
        {banners.map((item, index) => (
          <div key={index} style={{ width: "100%" }} className="">
            <Image
              width={1920}
              height={1080}
              className="lg:h-[400px] h-[160px] sm:h-[200px] md:h-[250px] w-[100%] rounded-lg lg:rounded-none sm:rounded-lg"
              src={item.image}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default MainSlider;