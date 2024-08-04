"use client";
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Twitter from "@/assets/Twitter.png";
import Youtube from "@/assets/Youtube.png";
import logo from "@/assets/Grazle Logo.png";
import Email from "@/assets/email-icon.png";
import Phone from "@/assets/phone-icon.png";
import { SiLinkedin } from "react-icons/si";
import Dribbble from "@/assets/Dribbble.png";
import { GrInstagram } from "react-icons/gr";
import Instagram from "@/assets/Instagram.png";
import { FaChevronDown } from "react-icons/fa6";
import Location from "@/assets/location-icon.png";
import { FaFacebook, FaPinterest, FaTwitter } from "react-icons/fa";
import { getAllCategoriesApi } from "@/apis";
interface FAQData {
  header: string;
}

export default function Footer() {
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await getAllCategoriesApi();
      setAllCategories(data?.categories || []);
    })();
  }, []);
  const accordionData: FAQData[] = [
    {
      header: "Product",
    },
    {
      header: "Company",
    },
    {
      header: "Support",
    },
    {
      header: "Legal",
    },
  ];

  const [expanded, setExpanded] = useState<number | null>(null);

  const handleAccordionChange =
    (panelIndex: number) =>
      (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panelIndex : null);
      };

  return (
    <>
      <div className="lg:px-[150px] md:px-[60px] px-[16px] py-[63px] bg-[#F8F8F8]  lg:flex sm:hidden hidden  items-start lg:items-start justify-between">
        <div className="w-full lg:w-[196px] mb-[32px] lg:mb-0 text-center lg:text-left">
          <Image
            src={logo}
            alt=""
            className="w-[120px] h-[70px] mx-auto lg:mx-0"
          />

          <div className="flex items-center gap-2 justify-center lg:justify-start mt-[40px]">
            <Image
              src={Instagram}
              alt=""
              className="w-[32px] h-[32px] mx-2 lg:mx-0"
            />
            <Image
              src={Dribbble}
              alt=""
              className="w-[32px] h-[32px] mx-2 lg:mx-0"
            />
            <Image
              src={Twitter}
              alt=""
              className="w-[32px] h-[32px] mx-2 lg:mx-0"
            />
            <Image
              src={Youtube}
              alt=""
              className="w-[32px] h-[32px] mx-2 lg:mx-0"
            />
          </div>
        </div>

        <div className="w-full lg:w-[130px] text-[#393A44] mb-[32px] lg:mb-0 text-center lg:text-left">
          <p className="text-[20px] font-bold">Categories</p>
          {allCategories?.slice(0, 5)?.map((category) => (
            <>
              <Link
                key={category?.id}
                href={`/search?category=${category?.id}`}
                className="text-[14px] font-normal mt-[12px] w-full"
              >
                {category?.name}
              </Link>
              <br />
            </>
          ))}

          {/* <div className="flex items-center justify-center lg:justify-start mt-[12px]">
            <p className="text-[14px] font-normal">Features</p>
            <p className="text-[14px] font-bold ml-[12px] text-[#2EC5CE]">
              New
            </p>
          </div> */}

          {/* <p className="text-[14px] font-normal mt-[12px]">Tutorials</p>
          <p className="text-[14px] font-normal mt-[12px]">Pricing</p>
          <p className="text-[14px] font-normal mt-[12px]">Releases</p> */}
        </div>

        <div className="w-full lg:w-[130px] text-[#393A44] mb-[32px] lg:mb-0 text-center lg:text-left">
          <p className="text-[20px] font-bold">Company</p>
          <Link
            href={"/Terms&Conditions"}
            className="text-[14px] font-normal mt-[16px]"
          >
            About
          </Link>
          <br />
          <Link
            href={"/ContactSupport"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Contact
          </Link>
        </div>

        <div className="w-full lg:w-[130px] text-[#393A44] mb-[32px] lg:mb-0 text-center lg:text-left">
          <p className="text-[20px] font-bold">Support</p>
          <Link
            href={"/ContactSupport"}
            className="text-[14px] font-normal mt-[16px]"
          >
            Help Center
          </Link>
          <br />
          <Link
            href={"/ContactSupport"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Safety Center
          </Link>
          <br />
          {/* <Link
            href={"/Terms&Conditions"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Legal
          </Link>

          <Link
            href={"/Terms&Conditions"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Privacy policy
          </Link> */}
          {/* <p className="text-[14px] font-normal mt-[12px]">Status</p> */}
        </div>

        <div className="w-full lg:w-[130px] text-[#393A44] mb-[32px] lg:mb-0 text-center lg:text-left">
          <p className="text-[20px] font-bold">Legal</p>
          {/* <Link href={'/Terms&Conditions'} className="text-[14px] font-normal mt-[16px]">Cookies Policy</Link> */}
          <Link
            href={"/privacy-policy"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Privacy Policy
          </Link>
          <br />
          <Link
            href={"/Terms&Conditions"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Terms of Service
          </Link>

          <br />
          <Link
            href={"/cancellation-policy"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Cancellation
          </Link>

          <br />
          <Link
            href={"/refund-policy"}
            className="text-[14px] font-normal mt-[12px]"
          >
            Refund Policy
          </Link>
        </div>

        <div className="w-full lg:w-[161px] text-[#393A44] text-center lg:text-left">
          <p className="text-[20px] font-bold">Reach us</p>

          <div className="flex items-center justify-center lg:justify-start mt-[26px]">
            <Image src={Email} alt="" className="w-[32px] h-[32px] mr-[8px]" />
            <p className="text-[14px] font-normal">ww@Grazle.com</p>
          </div>

          <div className="flex items-center justify-center lg:justify-start mt-[26px]">
            <Image src={Phone} alt="" className="w-[32px] h-[32px] mr-[8px]" />
            <p className="text-[14px] font-normal">+91 98765 43210</p>
          </div>

          <div className="flex items-center justify-center lg:justify-start mt-[26px]">
            <Image
              src={Location}
              alt="location"
              className="w-[32px] h-[32px] mr-[8px]"
            />
            <p className="text-[14px] font-normal">
              772 Lyonwood Ave Walnut, CA 91789
            </p>
          </div>
        </div>
      </div>

      <div
        className="px-[16px] border-t-2 hidden lg:block lg:px-[150px] bg-[#F8F8F8] 
        py-6 md:px-[60px] flex-wrap lg:flex sm:flex-wrap items-center justify-between"
      >
        <p className="text-[14px]  font-normal lg:text-start text-center">
          © 2024 Grazzle. All rights reserved
        </p>

        <div className="flex items-center lg:justify-start justify-center  ">
          <Link
            href="/Terms&Conditions"
            className="lg:text-[14px] text-[10px] font-normal"
          >
            Terms & Conditions
          </Link>

          <div className="border-l-[1px] border-[#909198] mx-2 h-2"></div>
          <Link
            href="/privacy-policy"
            className="lg:text-[14px] text-[10px] font-normal"
          >
            Privacy Policy
          </Link>

          {/* <div className="border-l-[1px] border-[#909198] mx-2 h-2"></div>
          <p className="lg:text-[14px] text-[10px] font-normal">Sitemap</p>
          <div className="border-l-[1px] border-[#909198] mx-2 h-2"></div>
          <p className="lg:text-[14px] text-[10px] font-normal">Disclaimer</p> */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-col lg:hidden mx-[20px]">
        <Image src={logo} alt="" className="w-[120px] h-[70px] " />

        {/* <p className="mt-3 text-[14px] font-normal text-[#4E4E4E]">
          Lorem ipsum dolor sit amet cons ectet ur. Nunc sed erat tristique sed
          magna. Eget condimentum.
        </p> */}

        <p className="mt-3 text-[16px] font-semibold text-[#4E4E4E]">
          Follow Us
        </p>

        <div className="flex items-center gap-6  mt-4">
          <FaTwitter className="text-[24px] text-[#434343]" />
          <FaFacebook className="text-[24px] text-[#434343]" />
          <SiLinkedin className="text-[24px] text-[#434343]" />
          <FaPinterest className="text-[24px] text-[#434343]" />
          <GrInstagram className="text-[24px] text-[#434343]" />
        </div>


        <div>
          {accordionData.map((data, index) => (
            <Accordion
              key={index}
              style={{
                backgroundColor: "transparent",
                border: "none",
                boxShadow: "none",
                borderBottom: "1px solid #0000001A",
              }}
              expanded={expanded === index}
              onChange={handleAccordionChange(index)}
            >
              <AccordionSummary
                style={{
                  padding: "10px 0px",
                  borderRadius: "0px",
                }}
                expandIcon={<FaChevronDown style={{ color: "#434343" }} />}
                aria-controls={`panel${index + 1}-content`}
                id={`panel${index + 1}-header`}
              >
                <Typography style={{ fontWeight: "500" }}>
                  <p
                    style={{
                      textAlign: "start",
                      color: "#434343",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    {data.header}
                  </p>
                </Typography>
              </AccordionSummary>

              <AccordionDetails
                style={{
                  padding: "0px 0px 16px 0px",
                  textAlign: "start",
                  textJustify: "none",
                }}
              >
                <Typography
                  style={{
                    backgroundColor: "transparent",
                    paddingTop: "0px",
                  }}
                >
                  {index === 0 && (
                    <>
                      {allCategories?.slice(0, 5)?.map((category) => (
                        <Link
                          key={category?.id}
                          href={`/search?category=${category?.id}`}
                          className="text-[14px] font-normal mt-[12px] block"
                        >
                          {category?.name}
                        </Link>
                      ))}
                    </>
                  )}
                  {index === 1 && (
                    <>
                      <Link href="/Terms&Conditions" className="text-[14px] font-normal mt-[12px] block">
                        About
                      </Link>
                      <Link href="/ContactSupport" className="text-[14px] font-normal mt-[12px] block">
                        Contact
                      </Link>
                    </>
                  )}
                  {index === 2 && (
                    <>
                      <Link href="/ContactSupport" className="text-[14px] font-normal mt-[12px] block">
                        Help Center
                      </Link>
                      <Link href="/ContactSupport" className="text-[14px] font-normal mt-[12px] block">
                        Safety Center
                      </Link>
                    </>
                  )}
                  {index === 3 && (
                    <>
                      <Link href="/privacy-policy" className="text-[14px] font-normal mt-[12px] block">
                        Privacy Policy
                      </Link>
                      <Link href="/Terms&Conditions" className="text-[14px] font-normal mt-[12px] block">
                        Terms of Service
                      </Link>
                      <Link href="/cancellation-policy" className="text-[14px] font-normal mt-[12px] block">
                        Cancellation
                      </Link>
                      <Link href="/refund-policy" className="text-[14px] font-normal mt-[12px] block">
                        Refund Policy
                      </Link>
                    </>
                  )}
                  {index === 4 && (
                    <>
                      <div className="flex items-center mt-[12px]">
                        <Image src={Email} alt="" className="w-[24px] h-[24px] mr-[8px]" />
                        <p className="text-[14px] font-normal">ww@Grazle.com</p>
                      </div>
                      <div className="flex items-center mt-[12px]">
                        <Image src={Phone} alt="" className="w-[24px] h-[24px] mr-[8px]" />
                        <p className="text-[14px] font-normal">+91 98765 43210</p>
                      </div>
                      <div className="flex items-center mt-[12px]">
                        <Image src={Location} alt="location" className="w-[24px] h-[24px] mr-[8px]" />
                        <p className="text-[14px] font-normal">
                          772 Lyonwood Ave Walnut, CA 91789
                        </p>
                      </div>
                    </>
                  )}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        <p className="text-[16px] font-semibold text-[#4E4E4E] mt-[24px] mb-[16px]">
          Follow Us
        </p>

        <div className="flex items-center gap-6 mb-[24px]">
          <FaTwitter className="text-[24px] text-[#434343]" />
          <FaFacebook className="text-[24px] text-[#434343]" />
          <SiLinkedin className="text-[24px] text-[#434343]" />
          <FaPinterest className="text-[24px] text-[#434343]" />
          <GrInstagram className="text-[24px] text-[#434343]" />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-[16px]">
          <Link href="/Terms&Conditions" className="text-[12px] font-normal">
            Terms of Service
          </Link>
          <Link href="/privacy-policy" className="text-[12px] font-normal">
            Privacy Policy
          </Link>
        </div>

        <p className="text-[12px] font-normal text-center text-[#949494]">
          © 2024 Grazle. All rights reserved
        </p>
      </div>
    </>
  );
}