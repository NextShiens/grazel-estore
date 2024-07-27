import React from "react";
import Image from "next/image";
import bg from "@/assets/2 copy.png";
import logo from "@/assets/BG (1).jpeg";
import Carousel from "react-multi-carousel";
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

const sliderItems = [
  {
    imageUrl: logo,
    Heading: "Water Fall View",
    text: "Lorem Ipsum is simply dummy text of the printing an...",
  },
  {
    imageUrl: bg,
    Heading: "Swat Kalam",
    text: "Lorem Ipsum is simply dummy text of the printing an...",
  },
  {
    imageUrl: logo,
    Heading: "Malam Jabba",
    text: "Lorem Ipsum is simply dummy text of the printing an...",
  },
];

const MainSlider = ({ banners }) => {
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
        {banners.length > 0 &&
          banners.map((item, index) => (
            <div key={index} style={{ width: "100%" }} className="">
              <Image
                src={item.imageUrl}
                className="lg:h-[400px] h-[160px] sm:h-[200px] md:h-[250px] w-[100%]  rounded-lg lg:rounded-none sm:rounded-lg"
              />
            </div>
          ))}

        {banners.length < 1 &&
          sliderItems.map((item, index) => (
            <div key={index} style={{ width: "100%" }} className="">
              <Image
                src={item.imageUrl}
                className="lg:h-[400px] h-[160px] sm:h-[200px] md:h-[250px] w-[100%]  rounded-lg lg:rounded-none sm:rounded-lg"
              />
            </div>
          ))}
      </Carousel>
    </div>
  );
};

export default MainSlider;
