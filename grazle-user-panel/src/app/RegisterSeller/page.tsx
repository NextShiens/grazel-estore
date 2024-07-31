"use client";

import Image from "next/image";
import { toast } from "react-toastify";
import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { registerApiStore } from "@/apis/index";
import logo from "@/assets/Grazle Logo.png";
import { useRouter } from "next/navigation";
import CustomStepper from "@/components/Stepper";
import { Avatar, Checkbox, CircularProgress, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import register from "@/assets/girl-shopping-online-with-credit-card-3d-character-illustration-png 1.png";
import { State, City } from "country-state-city";
import { IState, ICity } from "country-state-city/lib/interface";

interface FormValues {
  role: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  state?: string;
  city?: string;
  pin_code?: string;
  store_about?: string;
  store_name?: string;
  store_url?: string;
  gst?: string;
  pan?: string;
  store_description?: string;
  account_number?: string;
  account_name?: string;
  bank_code?: string;
  bank_name?: string;
}

const steps = [
  { id: "01", label: "Personal Details" },
  { id: "02", label: "Store Details" },
  { id: "03", label: "Bank Details" },
];

export default function RegisterSeller() {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [screenName, setScreenName] = useState<string>("Personal Details");
  const [formValues, setFormValues] = useState<FormValues>({ role: "seller" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [storeImage, setStoreImage] = useState<File | null>(null);

  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  const handleStateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const stateCode = e.target.value;
    setCities(City.getCitiesOfState("IN", stateCode) || []);
    setFormValues({ ...formValues, state: stateCode });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStoreImage(e.target.files[0]);
    }
  };

  const handleNext = () => {
    if (screenName === "Personal Details") {
      setScreenName("Store Details");
    } else if (screenName === "Store Details") {
      setScreenName("Bank Details");
    }
    setSelectedStep(selectedStep + 1);
  };

  const handleBack = () => {
    if (screenName === "Store Details") {
      setScreenName("Personal Details");
    } else if (screenName === "Bank Details") {
      setScreenName("Store Details");
    }
    setSelectedStep(selectedStep - 1);
  };

  async function onRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (screenName !== "Bank Details") {
        handleNext();
      } else {
        const formData = new FormData();
        Object.entries(formValues).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        if (storeImage) {
          formData.append('store_image', storeImage);
        }

        const response = await registerApiStore(formData);
        toast.success("Account created successfully Please wait for Admin to approve your Seller Account");
        router.push("/");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        const { message, errors } = err.response.data;
        toast.error(message || "An error occurred during registration");
        if (errors) {
          Object.entries(errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((error) => toast.error(`${key}: ${error}`));
            }
          });
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full mb-10 flex flex-wrap lg:flex-nowrap items-center lg:p-[50px] p-[10px]">
      <div
        style={{
          background:
            "linear-gradient(162.65deg, #FF781E 1.87%, #FDC197 88.1%)",
        }}
        className="lg:w-1/2 w-full lg:h-screen h-[60vh] text-white relative lg:rounded-[60px] rounded-[20px] px-[40px] py-[50px] mb-[50px]"
      >
        <p className="md:text-[30px] text-[20px] font-semibold">
          Discover endless possibilities
        </p>
        <div className="lg:w-4/5 w-full">
          <p className="md:text-[60px] text-[30px] font-bold">
            Explore, buy, and sell with our vibrant marketplace
          </p>
        </div>
        <Image
          src={register}
          alt=""
          className="w-auto bottom-0 absolute right-0 lg:h-[500px] h-[350px]"
        />
      </div>
      <div className="lg:w-1/2 w-full h-auto lg:pl-[50px] lg:m-0 m-3 lg:pb-[50px]">
        <div className="flex flex-col justify-center items-center">
          <Image src={logo} alt="" className="w-[170px] h-[100px]" />
          <p className="mt-6 lg:text-[32px] text-[20px] font-semibold">
            Become a Seller!
          </p>
          <div className="w-full mt-4">
            <CustomStepper steps={steps} selectedStep={selectedStep} />
          </div>
          {selectedStep > 0 && (
            <IconButton
              onClick={handleBack}
              className="self-start mt-4"
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <form onSubmit={onRegister} className="w-full">
            {screenName === "Personal Details" && (
              <div>
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[40px]"
                  placeholder="Full Name"
                  name="username"
                  required
                  value={formValues.username || ""}
                  onChange={handleInputChange}
                />
                <div className="flex flex-wrap lg:flex-nowrap items-center lg:gap-4">
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Email Address"
                    name="email"
                    required
                    type="email"
                    value={formValues.email || ""}
                    onChange={handleInputChange}
                  />
                  <div className="relative mt-[20px] w-full">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Contact number"
                      className="bg-[#F5F7F9] w-full pl-14 rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777]"
                      value={formValues.phone || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Password"
                  name="password"
                  required
                  minLength={8}
                  type="password"
                  value={formValues.password || ""}
                  onChange={handleInputChange}
                />
                <div className="flex flex-wrap lg:flex-nowrap items-center lg:gap-4">
                  <select
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777] mt-[20px]"
                    name="state"
                    onChange={handleStateChange}
                    required
                    value={formValues.state || ""}
                  >
                    <option value="" disabled>
                      State
                    </option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none text-[#777777] mt-[20px]"
                    name="city"
                    onChange={handleInputChange}
                    required
                    value={formValues.city || ""}
                  >
                    <option value="" disabled>
                      City
                    </option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Pin Code"
                  name="pin_code"
                  value={formValues.pin_code || ""}
                  onChange={handleInputChange}
                />
                <textarea
                  className="bg-[#F5F7F9] w-full rounded-md h-[100px] resize-none p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="About"
                  name="store_about"
                  value={formValues.store_about || ""}
                  onChange={handleInputChange}
                />
                <div className="flex items-center mt-4">
                  <Checkbox
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    sx={{
                      color: "#F70000",
                      "& .MuiSvgIcon-root": { fontSize: 24 },
                      "&.Mui-checked": { color: "#F70000" },
                    }}
                  />
                  <p className="text-black font-normal lg:text-[16px] text-[11px]">
                    By Clicking I agree to all terms of services and Privacy &
                    Policy.
                  </p>
                </div>
              </div>
            )}
            {screenName === "Store Details" && (
              <div className="mt-5">
                <div className="flex justify-center">
                  <Avatar className="h-[80px] w-[80px]" />
                </div>
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Store Name"
                  name="store_name"
                  required
                  value={formValues.store_name || ""}
                  onChange={handleInputChange}
                />
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Store Url"
                  name="store_url"
                  value={formValues.store_url || ""}
                  onChange={handleInputChange}
                />
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="GST no."
                    name="gst"
                    required
                    value={formValues.gst || ""}
                    onChange={handleInputChange}
                  />
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="PAN no."
                    name="pan"
                    required
                    value={formValues.pan || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <textarea
                  className="bg-[#F5F7F9] w-full rounded-md h-[100px] resize-none p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Description"
                  name="store_description"
                  required
                  value={formValues.store_description || ""}
                  onChange={handleInputChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-[20px]"
                />
              </div>
            )}
            {screenName === "Bank Details" && (
              <div className="mt-10">
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Account Number"
                  name="account_number"
                  required
                  value={formValues.account_number || ""}
                  onChange={handleInputChange}
                />
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Account Name"
                  name="account_name"
                  required
                  value={formValues.account_name || ""}
                  onChange={handleInputChange}
                />
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Bank Code"
                  name="bank_code"
                  required
                  value={formValues.bank_code || ""}
                  onChange={handleInputChange}
                />
                <input
                  className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                  placeholder="Bank Name"
                  name="bank_name"
                  required
                  value={formValues.bank_name || ""}
                  onChange={handleInputChange}
                />
              </div>
            )}

            <button
              className={`${!isChecked && "opacity-50"
                } bg-[#F70000] mb-4 rounded-xl h-[50px] mt-[50px] w-full text-[18px] font-medium text-white flex justify-center items-center`}
              type="submit"
              disabled={!isChecked || isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : screenName === "Bank Details" ? (
                "Create account"
              ) : (
                "Next"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}