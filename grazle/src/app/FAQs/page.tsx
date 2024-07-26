"use client";
import {
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { faqsArray } from "../../utils/faqs";

interface FAQData {
  header: string;
}

export default function FAQs() {
  const [currentType, setCurrentType] = useState("General");

  const [expanded, setExpanded] = useState<number | null>(null);

  const handleAccordionChange =
    (panelIndex: number) =>
    (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panelIndex : null);
    };

  const uniqueTypes = faqsArray.reduce((acc, faq) => {
    const typeExists = acc.some((typeExists) => typeExists.type === faq.type);
    if (!typeExists) {
      acc.push(faq);
    }
    return acc;
  }, []);

  return (
    <div className=" lg:my-[80px] my-[20px] sm:my-[20px] md:my-[30px] lg:mx-[150px] mx-[20px] sm:mx-[20px] md:mx-[30px]">
      <div className="flex flex-wrap lg:flex-nowrap sm:flex-wrap md:flex-wrap items-start gap-6">
        <div
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="rounded-3xl p-[30px] lg:w-[23%] w-[100%]  "
        >
          {uniqueTypes.map((data, index) => (
            <div
              className="cursor-pointer"
              key={index}
              onClick={() => setCurrentType(data?.type)}
            >
              <div
                className={` ${
                  currentType === data.type
                    ? "border-l-[4px] rounded-sm border-[#F70000]"
                    : ""
                } mt-8 rounded-sm`}
              >
                <p className="ml-3  text-[18px] font-normal">{data.type}</p>
              </div>
            </div>
          ))}

          {/* <div className="mt-[40px]">
            <p className="ml-4 text-[#8B8B8B] text-[18px] font-normal">
              Account
            </p>
          </div>

          <div className="mt-[40px]">
            <p className="ml-4 text-[#8B8B8B] text-[18px] font-normal">
              Service
            </p>
          </div>

          <div className="mt-[40px]">
            <p className="ml-4 text-[#8B8B8B] text-[18px] font-normal">
              Profile
            </p>
          </div> */}

          {/* <div className="mt-[40px]">
            <p className="ml-4 text-[#8B8B8B] text-[18px] font-normal">
              Profit
            </p>
          </div>

          <div className="mt-[40px]">
            <p className="ml-4 text-[#8B8B8B] text-[18px] font-normal">About</p>
          </div> */}
        </div>

        <div
          style={{ boxShadow: "0px 4px 29px 0px #0000000A" }}
          className="rounded-3xl p-[30px] lg:w-[77%] w-[100%]  "
        >
          <p className="text-[24px] font-medium">
            Below are frequently asked questions, you may find the answer for
            yourself
          </p>

          <div>
            {faqsArray.map((data, index) => {
              if (data.type !== currentType) return null;
              return (
                <div key={index}>
                  <Accordion
                    style={{
                      backgroundColor: "transparent",
                      marginTop: "20px",
                      border: "none",
                      boxShadow: "none",
                    }}
                    expanded={expanded === index}
                    onChange={handleAccordionChange(index)}
                  >
                    <AccordionSummary
                      style={{
                        padding: "0px 16px",
                        backgroundColor: "rgba(247, 0, 0, 0.06)",
                        borderRadius: "8px",
                      }}
                      expandIcon={
                        <FaChevronDown style={{ color: "#434343" }} />
                      }
                      aria-controls={`panel${index + 1}-content`}
                      id={`panel${index + 1}-header`}
                    >
                      <Typography style={{ fontWeight: "500" }}>
                        <div>
                          <p
                            style={{
                              textAlign: "start",
                            }}
                          >
                            {data.question}
                          </p>
                        </div>
                      </Typography>
                    </AccordionSummary>

                    <AccordionDetails
                      style={{
                        padding: "0px 16px 16px 16px",
                        textAlign: "start",
                        textJustify: "none",
                      }}
                    >
                      <Typography
                        style={{
                          backgroundColor: "transparent",
                          paddingTop: "10px",
                        }}
                      >
                        {data.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
