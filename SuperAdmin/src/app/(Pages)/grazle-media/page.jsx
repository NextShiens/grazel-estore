"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import SearchOnTop from "@/components/SearchOnTop";
import { updatePageLoader, updatePageNavigation } from "@/features/features";
import { axiosPrivate } from "@/axios";

import editButton from "@/assets/svgs/edit-button.svg";
import deleteButton from "@/assets/svgs/delete-button.svg";
import Loading from "@/components/loading";

const GrazleMedia = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [action, setAction] = useState("");

  const [loggedIn, setLoggedIn] = useState(true);
  const [loginChecked, setLoginChecked] = useState(false);

  const getLocalStorage = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  const token = getLocalStorage("token");

  useEffect(() => {
    handleCheckLogin();
  }, []);

  const handleCheckLogin = () => {
    if (!token) {
      setLoggedIn(false);
      router.push("/");
    } else {
      setLoggedIn(true);
    }
    setLoginChecked(true);
  };

  useEffect(() => {
    if (loginChecked && loggedIn) {
      dispatch(updatePageLoader(false));
      dispatch(updatePageNavigation("grazle-media"));
      fetchBanners();
    }
  }, [dispatch, loginChecked, loggedIn]);

  const fetchBanners = async () => {
    if (!loggedIn) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axiosPrivate.get("/admin/banners", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Update the is_active property to match the active field
      const updatedBanners = response.data?.banners.map(banner => ({
        ...banner,
        is_active: banner.active
      }));
      setBanners(updatedBanners);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to fetch banners. Please try again.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!loggedIn) return;
    try {
      const token = localStorage.getItem('token');
      await axiosPrivate.delete(`/admin/banners/${selectedBanner.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBanners(banners.filter(banner => banner.id !== selectedBanner.id));
      setModalOpen(false);
      toast.success("Banner deleted successfully");
    } catch (err) {
      console.error("Error deleting banner:", err);
      toast.error("Failed to delete banner. Please try again.");
    }
  };

  const handleToggleActivation = async () => {
    if (!loggedIn) return;
    const endpoint = selectedBanner.is_active ? 'deactivate' : 'activate';

    try {
      const token = localStorage.getItem('token');
      await axiosPrivate.put(
        `/admin/banners/${selectedBanner.id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the state locally
      setBanners(banners.map(banner =>
        banner.id === selectedBanner.id
          ? { ...banner, is_active: !banner.is_active }
          : banner
      ));

      setModalOpen(false);
      toast.success(`Banner ${endpoint}d successfully`);
    } catch (err) {
      console.error(`Error ${endpoint}ing banner:`, err);
      toast.error(`Failed to ${endpoint} banner. Please try again.`);
    }
  };

  const openModal = (banner, actionType) => {
    if (!loggedIn) return;
    setSelectedBanner(banner);
    setAction(actionType);
    setModalOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading />}
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop showButton={true} navigateTo={"/grazle-media/add"} />
            <div className="bg-white rounded-[8px] shadow-sm p-[10px] sm:p-[25px] mt-[25px]">
              <p className="text-[19px] sm:text-[24px] font-[600]">
                Banners Management
              </p>
              {error && <p className="text-red-500 mt-4">{error}</p>}
              <div className="mt-[25px] flex flex-col gap-7">
                {banners.map((banner) => (
                  <MediaData
                    key={banner.id}
                    banner={banner}
                    onDelete={() => openModal(banner, 'delete')}
                    onToggleActivation={() => openModal(banner, 'toggle')}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">
          {action === 'delete' ? 'Confirm Deletion' : 'Confirm Action'}
        </h2>
        <p>
          {action === 'delete'
            ? 'Are you sure you want to delete this banner?'
            : `Are you sure you want to ${selectedBanner?.is_active ? 'deactivate' : 'activate'} this banner?`}
        </p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setModalOpen(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={action === 'delete' ? handleDelete : handleToggleActivation}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
};

const MediaData = ({ banner, onDelete, onToggleActivation }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/grazle-media/edit/${banner.id}`);
  };

  return (
    <div className={`flex flex-col xl:flex-row gap-3 xl:gap-5 p-4 rounded-lg ${banner.is_active ? 'bg-green-50' : 'bg-red-50'}`}>
      <div>
        <Image
          alt={banner.title}
          src={banner.image}
          width={600}
          height={230}
          className="rounded-[5px] min-h-[150px] sm:h-[230px] w-[600px] object-cover object-right"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between gap-3">
        <div>
          <p className="sm:text-[22px] font-[500]">{banner.title}</p>
          <p className="text-[14px] sm:text-[18px] mt-2 text-[var(--text-color-body)]">
            Position: {banner.position}
          </p>
          <p className="text-[14px] sm:text-[18px] mt-2 text-[var(--text-color-body)]">
            View: {banner.type}
          </p>
          <p className={`text-[14px] sm:text-[18px] mt-1 font-semibold ${banner.is_active ? 'text-green-600' : 'text-red-600'}`}>
            Status: {banner.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex xl:justify-end gap-3 xl:max-w-[320px]">
          <button onClick={handleEdit} className="cursor-pointer">
            <Image alt="Edit" src={editButton} />
          </button>
          <button onClick={onDelete} className="cursor-pointer">
            <Image alt="Delete" src={deleteButton} />
          </button>
          <button
            onClick={onToggleActivation}
            className={`px-3 py-1 rounded ${banner.is_active
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
              }`}
          >
            {banner.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrazleMedia;

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <div className="mb-4">{children}</div>
      </div>
    </div>
  );
};