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
import CameraAltIcon from "@mui/icons-material/CameraAlt";
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
  const [errors, setErrors] = useState<Partial<FormValues>>({});

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
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    validateField(name, value);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStoreImage(e.target.files[0]);
    }
  };

  const validateField = (name: string, value: string) => {
    let error = "";
    switch (name) {
      case "username":
        if (value.length < 3) error = "Name must be at least 3 characters long";
        break;
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email address";
        break;
      case "phone":
        if (!/^\d{10}$/.test(value)) error = "Phone number must be 10 digits";
        break;
      case "password":
        if (value.length < 8) error = "Password must be at least 8 characters long";
        break;
      case "pin_code":
        if (!/^\d{6}$/.test(value)) error = "Pin code must be 6 digits";
        break;
        case "store_url":
          // Simplified regular expression to validate a URL
          const urlPattern = new RegExp(
            '^(https?:\\/\\/)?' + // protocol
            '((([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,})|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?' + // port
            '(\\/[-a-zA-Z0-9%_.~+]*)*' + // path
            '(\\?[;&a-zA-Z0-9%_.~+=-]*)?' + // query string
            '(\\#[-a-zA-Z0-9_]*)?$' // fragment locator
          );
        
          if (!urlPattern.test(value)) error = "Please enter a valid URL";
          break;
      // case "gst":
      //   if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(value)) error = "Invalid GST number";
      //   break;
      // case "pan":
      //   if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) error = "Invalid PAN number";
      //   break;
      // case "account_number":
      //   if (!/^\d{9,18}$/.test(value)) error = "Account number must be between 9 and 18 digits";
      //   break;
      // case "bank_code":
      //   if (!/^\d{11}$/.test(value)) error = "Bank code must be 11 digits";
      //   break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
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
    if (Object.values(errors).some(error => error !== "")) {
      toast.error("Please correct all errors before submitting");
      return;
    }
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
        toast.success("Account created successfully. Please wait for Admin to approve your Seller Account");
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
    <>
      <div className="w-full mb-10 flex flex-wrap lg:flex-nowrap items-center justify-center lg:p-[50px] p-[10px]">
        <div className="lg:w-1/2 w-full h-auto lg:p-[50px] p-[25px] lg:m-0 m-3 lg:pb-[50px] shadow-xl rounded-xl ">
          <div className="flex flex-col justify-center items-center">
            <Image src={logo} alt="" className="w-[170px] h-[100px]" />
            <p className="mt-6 lg:text-[32px] text-[20px] font-semibold">
              Become a Seller!
            </p>
            <div className="w-full mt-4 flex items-center justify-center mr-4">
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
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
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
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
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
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
                  {errors.pin_code && <p className="text-red-500 text-sm">{errors.pin_code}</p>}
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
                    <label htmlFor="store-image-upload" className="cursor-pointer">
                      <input
                        id="store-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Avatar className="h-[80px] w-[80px]">
                        {storeImage ? (
                          <img src={URL.createObjectURL(storeImage)} alt="Store" className="h-full w-full object-cover" />
                        ) : (
                          <CameraAltIcon className="h-[40px] w-[40px]" />
                        )}
                      </Avatar>
                    </label>
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
                  {errors.store_url && <p className="text-red-500 text-sm">{errors.store_url}</p>}
                  <div className="flex flex-wrap lg:flex-nowrap items-center gap-6">
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                      placeholder="GST no. (Optional)"
                      name="gst"
                      required
                      value={formValues.gst || ""}
                      onChange={handleInputChange}
                    />
                    {errors.gst && <p className="text-red-500 text-sm">{errors.gst}</p>}
                    <input
                      className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                      placeholder="PAN no."
                      name="pan"
                      required
                      value={formValues.pan || ""}
                      onChange={handleInputChange}
                    />
                    {errors.pan && <p className="text-red-500 text-sm">{errors.pan}</p>}
                  </div>
                  <textarea
                    className="bg-[#F5F7F9] w-full rounded-md h-[100px] resize-none p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Description"
                    name="store_description"
                    required
                    value={formValues.store_description || ""}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {screenName === "Bank Details" && (
                <div className="mt-10">
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Account Number (Optional)"
                    name="account_number"
                    required
                    value={formValues.account_number || ""}
                    onChange={handleInputChange}
                  />
                  {errors.account_number && <p className="text-red-500 text-sm">{errors.account_number}</p>}
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Account Name (Optional)"
                    name="account_name"
                    required
                    value={formValues.account_name || ""}
                    onChange={handleInputChange}
                  />
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Bank Code (Optional)"
                    name="bank_code"
                    required
                    value={formValues.bank_code || ""}
                    onChange={handleInputChange}
                  />
                  {errors.bank_code && <p className="text-red-500 text-sm">{errors.bank_code}</p>}
                  <input
                    className="bg-[#F5F7F9] w-full rounded-md h-[50px] p-3 focus:outline-none placeholder:text-[#777777] mt-[20px]"
                    placeholder="Bank Name (Optional)"
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
    </>
  );
}