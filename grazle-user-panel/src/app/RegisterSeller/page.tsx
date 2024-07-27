"use client";
import Image from "next/image";
import { toast } from "react-toastify";
import React, { useState } from "react";
import { registerApi } from "@/apis/index";
import logo from "@/assets/Grazle Logo.png";
import { useRouter } from "next/navigation";
import CustomStepper from "@/components/Stepper";
import { Avatar, Checkbox, Select } from "@mui/material";
import register from "@/assets/girl-shopping-online-with-credit-card-3d-character-illustration-png 1.png";

const steps = [
  {
    id: "01",
    lable: "Personal Details",
  },
  {
    id: "02",
    lable: "Social",
  },
  {
    id: "03",
    lable: "Bank Details",
  },
];

export default function RegisterSeller() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [selectedStep, setSelectedStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [screenName, setScreenName] = useState("Personal Details");
  const [formValues, setFormValues] = useState({ role: "seller" });
  console.log(formValues);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

  const handleClickNext = (formdata: any) => {
    let mergeObj;
    console.log(formdata);
    const formEntries = Object.fromEntries(formdata.entries());
    console.log(formdata.get("username"));
    if (Object.keys(formValues).length) {
      mergeObj = Object.assign(formValues, formEntries);
      setFormValues(mergeObj);
    } else {
      setFormValues(formEntries);
    }

    if (screenName == "Personal Details") {
      setScreenName("Store Details");
    }

    if (screenName == "Store Details") {
      setScreenName("Bank Details");
    }

    if (selectedStep < 2) {
      setSelectedStep(selectedStep + 1);
    }
  };

  async function onRegister(formdata: any) {
    let mergeObj;
    const formEntries = Object.fromEntries(formdata.entries());
    let newFormData = new FormData();
    try {
      if (!Object.keys(formValues).length) {
        return toast.error("Please fill all the fields");
      } else if (screenName == "Personal Details") {
        setFormValues(formEntries);
        setSelectedStep(selectedStep + 1);
        return setScreenName("Store Details");
      } else if (screenName == "Store Details") {
        mergeObj = Object.assign(formValues, formEntries);
        setFormValues(mergeObj);
        setSelectedStep(selectedStep + 2);
        return setScreenName("Bank Details");
      } else if (screenName === "Bank Details") {
        mergeObj = Object.assign(formValues, formEntries);
        mergeObj.role = "seller";
        for (let key in mergeObj) {
          newFormData.append(key, mergeObj[key]);
        }
        await registerApi(newFormData);
        toast.success("Account created successfully");
        router.push("/");
        // return console.log("submitted");
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
      toast.error(err?.response.data.message);
    }
  }

  return (
    <div className="w-[100%] mb-10 h-auto flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:p-[50px] p-[10px] sm:p-[10px] md:p-[10px] ">
      <div
        style={{
          background:
            "linear-gradient(162.65deg, #FF781E 1.87%, #FDC197 88.1%)",
        }}
        className="lg:w-[50%] w-[100%] lg:block flex flex-col sm:flex-col  sm:w-[100%] md:w-[100%] lg:h-[100vh] sm:h-[90vh] h-[60vh] text-white relative lg:rounded-[60px] rounded-[20px] sm:rounded-[20px] px-[40px] py-[50px] mb-[50px]"
      >
        <p className="md:text-[30px] text-[20px] font-semibold">
          Discover endless possibilities
        </p>
        <div className="lg:w-[80%] w-[100%] sm:w-[100%]">
          <p className="md:text-[60px] text-[30px] font-bold">
            Explore, buy, and sell with our vibrant maketplace
          </p>
        </div>

        <Image
          src={register}
          alt=""
          className="w-auto bottom-0 absolute right-0 lg:h-[500px] h-[350px] sm:h-[800px]"
        />
      </div>
      <div className="lg:w-[50%] w-[100%] sm:w-[100%] md:w-[100%]  h-auto lg:pl-[50px] lg:m-0 m-3 lg:pb-[50px] ">
        <div className="flex flex-col justify-center items-center ">
          <Image src={logo} alt="" className="w-[170px] h-[100px]" />
          <p className="mt-6 lg:text-[32px] text-[20px] sm:text-[20px] font-semibold">
            Become a Seller!
          </p>

          <div className="w-[100%] mt-4">
            <CustomStepper steps={steps} selectedStep={selectedStep} />
          </div>
          <form action={onRegister} className="w-[100%]">
            {screenName == "Personal Details" && (
              <div>
                <div className=" mt-[40px] w-full">
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Full NAME"
                    name="username"
                    required
                  />
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-4">
                  <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Email Address"
                      name="email"
                      required
                      type="email"
                    />
                  </div>
                  {/* <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Password"
                      name="password"
                      required
                      type="password"
                    />
                  </div> */}

                  {/* <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Contact Number"
                      type="tel"
                      required
                      name="phone"
                    />
                  </div> */}

                  <div className="relative  mt-[20px] w-full">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      pattern="\d{10}"
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="Contact number"
                      className="bg-[#F5F7F9] w-full pl-14 rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-4">
                  <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Password"
                      name="password"
                      required
                      min={8}
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap items-center lg:gap-4">
                  <div className=" mt-[20px] w-full">
                    {/* <select className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777]">
                      <option value="0">City</option>
                      <option value="1">Audi</option>
                      <option value="2">BMW</option>
                    </select> */}
                    <select
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777]"
                      name="city"
                    >
                      <option value="" disabled selected>
                        City
                      </option>
                      <option value="NewYork">New York</option>
                      <option value="LosAngeles">Los Angeles</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Houston">Houston</option>
                      <option value="Phoenix">Phoenix</option>
                    </select>
                  </div>
                  <div className=" mt-[20px] w-full">
                    <select
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777]"
                      name="state"
                    >
                      <option value="" disabled selected>
                        State
                      </option>
                      <option value="NewYork">New York</option>
                      <option value="LosAngeles">Los Angeles</option>
                      <option value="Chicago">Chicago</option>
                      <option value="Houston">Houston</option>
                      <option value="Phoenix">Phoenix</option>
                    </select>
                    {/* <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="State"
                      name="state"
                    /> */}
                    {/* <select className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777]">
                      <option value="0">State</option>
                      <option value="1">Audi</option>
                      <option value="2">BMW</option>
                    </select> */}
                  </div>
                </div>
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Address"
                    name="address"
                  />
                </div>
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Pin Code"
                    name="pinCode"
                  />
                </div>
                <div className=" mt-[20px] w-full">
                  <textarea
                    className="bg-[#F5F7F9]  w-full rounded-md h-[100px] resize-none p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="About"
                    name="about"
                  />
                </div>
                <div className="flex items-center mt-4">
                  <Checkbox
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    sx={{
                      color: "#F70000",
                      "& .MuiSvgIcon-root": {
                        fontSize: 24,
                      },
                      "&.Mui-checked": {
                        color: "#F70000",
                      },
                    }}
                  />
                  <p className="text-black font-normal lg:text-[16px] text-[11px] sm:text-[11px]">
                    By Clicking i agree all terms of services and Privacy &
                    Policy.
                  </p>
                </div>
              </div>
            )}
            {screenName == "Store Details" && (
              <div className="mt-5">
                <div className="flex justify-center">
                  <Avatar className="h-[80px] w-[80px]" />
                </div>
                <div>
                  <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Store Name"
                    />
                  </div>
                  <div className=" mt-[20px] w-full">
                    <input
                      className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Store Url"
                      name="storeUrl"
                    />
                  </div>
                  <div className="lg:flex-nowrap flex flex-wrap sm:flex-wrap md:flex-wrap items-center gap-6">
                    <div className=" mt-[20px] w-full">
                      <input
                        className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                        placeholder="Gst no. (optional)"
                        name="gst"
                      />
                    </div>
                    <div className=" mt-[20px] w-full">
                      <input
                        className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                        placeholder="PAN no. (optional)"
                        name="panNo"
                      />
                    </div>
                  </div>
                  <div className=" mt-[20px] w-full">
                    <textarea
                      className="bg-[#F5F7F9]  w-full rounded-md h-[100px] resize-none p-3 focus:outline-none placeholder:text-[#777777]"
                      placeholder="Description"
                      name="description"
                    />
                  </div>
                </div>
              </div>
            )}

            {screenName == "Bank Details" && (
              <div className="mt-10">
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Account Number (optional)"
                    name="accountNumber"
                  />
                </div>
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Account Name (optional)"
                    name="accountName"
                  />
                </div>
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Bank Code (optional)"
                    name="bankCode"
                  />
                </div>
                <div className=" mt-[20px] w-full">
                  <input
                    className="bg-[#F5F7F9]  w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                    placeholder="Bank Name (optional)"
                    name="bankName"
                  />
                </div>
              </div>
            )}

            <button
              className={`${
                !isChecked && "opacity-50"
              } bg-[#F70000] mb-4 rounded-xl h-[50px] mt-[50px] w-[100%] text-[18px] font-medium text-white`}
              type="submit"
              disabled={!isChecked}
            >
              {screenName == "Bank Details" ? "Create account" : "Next"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
