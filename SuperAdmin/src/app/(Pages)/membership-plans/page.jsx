"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { updatePageLoader, updatePageNavigation } from '@/features/features';
import Navbar from '@/components/navbar';
import Sidebar from '@/components/sidebar';
import SearchOnTop from '@/components/SearchOnTop';
import Loading from '@/components/loading';

const MembershipPlans = () => {
  const dispatch = useDispatch();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_months: '',
    discount: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(updatePageLoader(false));
    dispatch(updatePageNavigation('membership-plans'));
    fetchPlans();
  }, [dispatch]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/membership-plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        setPlans(response.data.membership_plans || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch plans');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError(error.message || 'An error occurred while fetching plans');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear validation error for this field when user starts typing
    setValidationErrors({ ...validationErrors, [e.target.name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key]);
    });

    try {
      if (currentPlan) {
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/membership-plans/${currentPlan.id}`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',

            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/membership-plans`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',

            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
      fetchPlans();
      setIsModalOpen(false);
      setCurrentPlan(null);
      setFormData({ name: '', price: '', duration_months: '', discount: '' });
    } catch (error) {
      console.error('Error saving plan:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        setError(error.response?.data?.message || 'An error occurred while saving the plan');
      }
    }
  };

  const handleEdit = (plan) => {
    setCurrentPlan(plan);
    setFormData(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/membership-plans/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        setError(error.response?.data?.message || 'An error occurred while deleting the plan');
      }
    }
  };

  return (
    <>
      <Loading />
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex-1 flex">
          <Sidebar />
          <div className="flex-1 mt-[30px] px-[10px] sm:px-[22px]">
            <SearchOnTop />
            <div className="my-[20px] p-[30px] bg-white rounded-[8px] shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Membership Plans</h1>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-md flex items-center"
                >
                  <FiPlus className="mr-2" /> Add New Plan
                </button>
              </div>
              {isLoading ? (
                <p>Loading plans...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : plans.length === 0 ? (
                <p className="text-gray-500">No membership plans available. Click Add New Plan to create one.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Duration (Months)</th>
                        <th className="px-4 py-2">Discount</th>
                        <th className="px-4 py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {plans.map((plan) => (
                        <tr key={plan.id} className="border-b border-gray-200 hover:bg-gray-100">
                          <td className="px-4 py-3">{plan.name}</td>
                          <td className="px-4 py-3">${plan.price}</td>
                          <td className="px-4 py-3">{plan.duration_months}</td>
                          <td className="px-4 py-3">{plan.discount}%</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleEdit(plan)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              {currentPlan ? 'Edit Plan' : 'Create New Plan'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${validationErrors.name ? 'border-red-500' : ''
                    }`}
                  required
                />
                {validationErrors.name && <p className="text-red-500 text-xs italic">{validationErrors.name[0]}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${validationErrors.price ? 'border-red-500' : ''
                    }`}
                  required
                />
                {validationErrors.price && <p className="text-red-500 text-xs italic">{validationErrors.price[0]}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration_months">
                  Duration (Months)
                </label>
                <input
                  type="number"
                  id="duration_months"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${validationErrors.duration_months ? 'border-red-500' : ''
                    }`}
                  required
                />
                {validationErrors.duration_months && <p className="text-red-500 text-xs italic">{validationErrors.duration_months[0]}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="discount">
                  Discount (%)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${validationErrors.discount ? 'border-red-500' : ''
                    }`}
                  required
                />
                {validationErrors.discount && <p className="text-red-500 text-xs italic">{validationErrors.discount[0]}</p>}
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {currentPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentPlan(null);
                    setFormData({ name: '', price: '', duration_months: '', discount: '' });
                    setValidationErrors({});
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default MembershipPlans;