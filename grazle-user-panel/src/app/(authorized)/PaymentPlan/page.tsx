'use client';
import React from "react";
import Image from "next/image";
import logo from "@/assets/Grazle Logo.png";
import Pay from "@/assets/Group 1820550001.png";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { confirmPlanPaymentApi, getActiveMembershipPlanApi, getAllMembershipPlansApi, getUserMembershipPlansApi, purchaseMembershipPlanApi } from "@/apis";

export default function PaymentPlan() {
  const Router = useRouter();
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [userMemberships, setUserMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("theUser"));
    console.log("User", user);
    if (user) {
      setUser(user);
      fetchData(user);
    }
  }, []);

  const fetchData = async (user) => {
    try {
      setLoading(true);
      const [plansResponse, activePlanResponse, userMembershipsResponse] = await Promise.allSettled([
        getAllMembershipPlansApi(),
        getActiveMembershipPlanApi(),
        getUserMembershipPlansApi()
      ]);
  
      if (plansResponse.status === 'fulfilled') {
        setPlans(plansResponse.value.data.membership_plans);
      }
  
      if (activePlanResponse.status === 'fulfilled') {
        setActivePlan(activePlanResponse.value.data.membership_plan);
      }
  
      if (userMembershipsResponse.status === 'fulfilled') {
        setUserMemberships(userMembershipsResponse.value.data.memberships);
      }
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId, planPrice) => {
    try {     
      const paymentData = {
        username: user.username,
        address: user.profile.address,
        planPrice: planPrice,
        planId: planId,
        // membershipId: response.data.membership.id
      };
      console.log("Payment data", paymentData);
      // Convert the data to a URL-safe string
      const encodedData = encodeURIComponent(JSON.stringify(paymentData));
      
      // Navigate to the Payment page with the data
      Router.push(`/Payment?data=${encodedData}`);
      
    } catch (err) {
      console.error("Failed to purchase plan", err);
      setError("Failed to purchase plan");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
  <div className="flex flex-col items-center justify-center">
    <Image
      src={logo}
      alt="Menu"
      className="lg:w-[216px] w-[100px] sm:w-[120px] md:w-[130px] lg:h-[127px] h-[70px] sm:h-[75px] md:h-[80px] mt-[52px]"
    />

    <p className="mt-[18px] lg:text-[40px] text-[24px] sm:text-[24px] md:text-[24px] font-bold">
      Buy Grazle Premium
    </p>

    <div className="flex flex-wrap sm:flex-wrap md:flex-wrap lg:flex-nowrap lg:mx-0 mx-3 sm:mx-3 md:mx-3 items-center gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          style={{
            boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
          }}
          className="rounded-3xl h-[400px] p-[20px] lg:w-[280px] w-[100%] sm:w-[100%] md:w-[100%] hover:border-[1px] border-[#F70000] mt-[38px] lg:mb-[92px] mb-[15px] sm:mb-[15px] md:mb-[15px]"
        >
          <div className="rounded-3xl flex items-center flex-col w-auto h-[230px] bg-[#FFFCFC]">
            <div className="bg-[#FFA31A] mt-[18px] rounded-sm flex items-center justify-center h-[61px] w-[58px]">
              <Image src={Pay} alt="" className="h-[29px] w-[29px]" />
            </div>
            <p className="mt-[18px] text-[24px] text-[#777777] font-normal">
              {plan.name}
            </p>
            <p className="text-[35px] text-[#F70000] font-bold">{plan.price}</p>
            {plan.discount_percentage > 0 && (
              <p className="text-[24px] text-[#777777] font-normal">{plan.discount_percentage}% Off</p>
            )}
          </div>

          <p className="text-[15px] text-[#777777] font-normal text-center mt-[25px]">
          </p>

          <p className="text-[15px] text-[#777777] font-normal text-center mt-[10px]">
            {plan.duration_months} days validity
          </p>

          <div className="flex mt-[30px] justify-center">
            <button
              className="bg-[#F70000] rounded-lg h-[50px] w-[275px] font-medium text-white"
              onClick={() => handlePurchase(plan.id, plan.price)}
              // disabled={activePlan !== null}
            >
              {activePlan ? "Plan Active" : "Continue Plan"}
            </button>
          </div>
        </div>
      ))}
    </div>

    {userMemberships && (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Memberships</h2>
        {userMemberships.map((membership) => (
          <div key={membership.id} className="mb-4 p-4 border rounded">
            <p>Plan: {membership.membership_plan.name}</p>
            <p>Status: {membership.status}</p>
            <p>Start Date: {new Date(membership.start_date).toLocaleDateString()}</p>
            <p>End Date: {new Date(membership.end_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);
}