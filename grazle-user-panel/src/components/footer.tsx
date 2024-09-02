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
import logo from "@/assets/Grazle Logo.png";
import Email from "@/assets/email-icon.png";
import Phone from "@/assets/phone-icon.png";
import { SiLinkedin } from "react-icons/si";
import { GrInstagram } from "react-icons/gr";
import { FaChevronDown } from "react-icons/fa6";
import Location from "@/assets/location-icon.png";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import { getAllCategoriesApi } from "@/apis";
import { useDispatch } from "react-redux";
import { setSelectedCategory } from "@/features/features";

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
    { header: "Product" },
    { header: "Company" },
    { header: "Support" },
    { header: "Legal" },
  ];

  const [expanded, setExpanded] = useState<number | null>(null);
  const dispatch = useDispatch();

  const handleAccordionChange =
    (panelIndex: number) =>
      (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        setExpanded(isExpanded ? panelIndex : null);
      };
  const handleCategoryClick = (category) => {
    console.log(category, "category");
    dispatch(setSelectedCategory(category));
  };

  return (
    <footer className="bg-[#F8F8F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Footer */}
        <div className="hidden lg:flex justify-between py-16">
          <div className="w-[196px]">
            <Image src={logo} alt="Grazle Logo" className="w-[120px] h-[70px]" />
            <div className="flex items-center gap-4 mt-8">
              <Link href="https://x.com/GrazleHomeware" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="text-2xl text-[#434343]" />
              </Link>
              <Link href="https://www.facebook.com/grazlefb/" target="_blank" rel="noopener noreferrer">
                <FaFacebook className="text-2xl text-[#434343]" />
              </Link>
              <Link href="https://www.linkedin.com/company/grazle" target="_blank" rel="noopener noreferrer">
                <SiLinkedin className="text-2xl text-[#434343]" />
              </Link>
              <Link href="https://www.instagram.com/homewarebygrazle?igsh=MXYxbXN0eG40MWtuNA==" target="_blank" rel="noopener noreferrer">
                <GrInstagram className="text-2xl text-[#434343]" />
              </Link>
            </div>
          </div>

          <div className="w-[130px] text-[#393A44]">
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            {allCategories?.slice(0, 5)?.map((category) => (
              <Link
                key={category?.id}
                href={`/search?category=${category?.id}`}
                className="block text-sm mb-2"
                onClick={() => handleCategoryClick(category)}
              >
                {category?.name}
              </Link>
            ))}
          </div>

          <div className="w-[130px] text-[#393A44]">
            <h3 className="text-xl font-bold mb-4">Company</h3>
            <Link href="/Terms&Conditions" className="block text-sm mb-2">About</Link>
            <Link href="/ContactSupport" className="block text-sm mb-2">Contact</Link>
          </div>

          <div className="w-[130px] text-[#393A44]">
            <h3 className="text-xl font-bold mb-4">Support</h3>
            <Link href="/ContactSupport" className="block text-sm mb-2">Help Center</Link>
            <Link href="/ContactSupport" className="block text-sm mb-2">Safety Center</Link>
          </div>

          <div className="w-[130px] text-[#393A44]">
            <h3 className="text-xl font-bold mb-4">Legal</h3>
            <Link href="/privacy-policy" className="block text-sm mb-2">Privacy Policy</Link>
            <Link href="/Terms&Conditions" className="block text-sm mb-2">Terms of Service</Link>
            <Link href="/cancellation-policy" className="block text-sm mb-2">Cancellation</Link>
            <Link href="/refund-policy" className="block text-sm mb-2">Refund Policy</Link>
          </div>

          <div className="w-[200px] text-[#393A44]">
            <h3 className="text-xl font-bold mb-4">Reach us</h3>
            <div className="flex items-center mb-4">
              <Image src={Email} alt="Email" className="w-8 h-8 mr-2" />
              <p className="text-sm">www.grazle.co.in</p>
            </div>
            <div className="flex items-center mb-4">
              <Image src={Phone} alt="Phone" className="w-8 h-8 mr-2" />
              <p className="text-sm">+9108202334</p>
            </div>
            <div className="flex items-start">
              <Image src={Location} alt="Location" className="w-8 h-8 mr-2 mt-1" />
              <p className="text-sm">MAHIPALPUR EXTN OPP. -APRAVTO MARUTI SHOWROOM, NEW DELHI 110037</p>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden py-8">
          <Image src={logo} alt="Grazle Logo" className="w-[120px] h-[70px] mb-6" />

          <h3 className="text-lg font-semibold text-[#4E4E4E] mb-4">Follow Us</h3>
          <div className="flex items-center gap-6 mb-8">
            <Link href="https://x.com/GrazleHomeware" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="text-2xl text-[#434343]" />
            </Link>
            <Link href="https://www.facebook.com/grazlefb/" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="text-2xl text-[#434343]" />
            </Link>
            <Link href="https://www.linkedin.com/company/grazle" target="_blank" rel="noopener noreferrer">
              <SiLinkedin className="text-2xl text-[#434343]" />
            </Link>
            <Link href="https://www.instagram.com/homewarebygrazle?igsh=MXYxbXN0eG40MWtuNA==" target="_blank" rel="noopener noreferrer">
              <GrInstagram className="text-2xl text-[#434343]" />
            </Link>
          </div>

          {accordionData.map((data, index) => (
            <Accordion
              key={index}
              expanded={expanded === index}
              onChange={handleAccordionChange(index)}
              className="shadow-none border-b border-gray-200"
            >
              <AccordionSummary
                expandIcon={<FaChevronDown className="text-[#434343]" />}
                aria-controls={`panel${index + 1}-content`}
                id={`panel${index + 1}-header`}
                className="px-0"
              >
                <Typography className="text-base font-semibold text-[#434343]">
                  {data.header}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className="px-0">
                {index === 0 && allCategories?.slice(0, 5)?.map((category) => (
                  <Link
                    key={category?.id}
                    href={`/search?category=${category?.id}`}
                    className="block text-sm mb-2"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category?.name}
                  </Link>
                ))}
                {index === 1 && (
                  <>
                    <Link href="/Terms&Conditions" className="block text-sm mb-2">About</Link>
                    <Link href="/ContactSupport" className="block text-sm mb-2">Contact</Link>
                  </>
                )}
                {index === 2 && (
                  <>
                    <Link href="/ContactSupport" className="block text-sm mb-2">Help Center</Link>
                    <Link href="/ContactSupport" className="block text-sm mb-2">Safety Center</Link>
                  </>
                )}
                {index === 3 && (
                  <>
                    <Link href="/privacy-policy" className="block text-sm mb-2">Privacy Policy</Link>
                    <Link href="/terms-of-service" className="block text-sm mb-2">Terms of Service</Link>
                    <Link href="/cancellation-policy" className="block text-sm mb-2">Cancellation Policy</Link>
                    <Link href="/refund-policy" className="block text-sm mb-2">Refund Policy</Link>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="py-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-[#949494] mb-4 sm:mb-0">
              © 2024 Grazle. All rights reserved
            </p>
            <div className="flex items-center">
              <Link href="/Terms&Conditions" className="text-sm mr-4">
                Terms of Service
              </Link>
              <Link href="/privacy-policy" className="text-sm">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}