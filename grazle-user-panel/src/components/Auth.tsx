"use client";
import { getProfileApi } from "@/apis";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Auth = () => {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfileApi();
        console.log(res);
      } catch (error) {
        if (error.response.data.success === false) {
          console.log(error);
          setTimeout(() => {
            localStorage.removeItem("token");
            router.push("/signIn");
          }, 2000);
        }
      }
    })();
  }, []);
  return <div></div>;
};

export default Auth;
