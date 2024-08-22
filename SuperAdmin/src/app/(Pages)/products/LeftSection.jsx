import React, { useEffect, useState } from "react";
import { Slider } from "antd";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

const LeftSection = ({
  allCategories,
  allBrands,
  onFilterProduct,
  onChangePrice,
  lowerPrice,
  higherPrice,
}) => {
  const [categoryId, setCategoryId] = useState([]);
  const [brandId, setBrandId] = useState([]);

  useEffect(() => {
    onFilterProduct({ category: categoryId[0], brand: brandId[0] });
  }, [brandId, categoryId]);

  const fn_checkedFilter = (id, type) => {
    if (type === "category") {
      setCategoryId(categoryId.includes(id) ? [] : [id]);
    } else {
      setBrandId(brandId.includes(id) ? [] : [id]);
    }
  };

  const clearFilters = () => {
    setCategoryId([]);
    setBrandId([]);
    onFilterProduct({ category: null, brand: null });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 lg:w-80">
      <h3 className="font-semibold text-lg mb-4">Filter</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-base mb-3">Price Range</h4>
          {lowerPrice && higherPrice && (
            <Slider
              min={lowerPrice}
              max={higherPrice}
              range
              defaultValue={[lowerPrice, higherPrice]}
              onChangeComplete={(priceArray) =>
                onChangePrice(priceArray, {
                  category: categoryId[0],
                  brand: brandId[0],
                })
              }
            />
          )}
        </div>
        <div>
          <h4 className="font-medium text-base mb-3">Categories</h4>
          <div className="space-y-2">
            {allCategories?.map((item, index) => (
              <RadioText
                key={index}
                text={item.name}
                id={item.id}
                status={categoryId.includes(item.id)}
                type="category"
                functionOnClick={fn_checkedFilter}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-base mb-3">Sort By</h4>
          <div className="space-y-2">
            <RadioText
              text="Newest"
              id="new"
              status={brandId.includes("new")}
              type="sortBy"
              functionOnClick={fn_checkedFilter}
            />
            <RadioText
              text="Oldest"
              id="old"
              status={brandId.includes("old")}
              type="sortBy"
              functionOnClick={fn_checkedFilter}
            />
            {allBrands?.map((item, index) => (
              <RadioText
                key={index}
                text={item.name}
                id={item.id}
                status={brandId.includes(item.id)}
                type="sortBy"
                functionOnClick={fn_checkedFilter}
              />
            ))}
          </div>
        </div>
        <div>
          <button
            className="bg-black text-red-600 py-2 px-4 rounded hover:bg-red-800 hover:text-white transition-colors horror-button flex items-center justify-center"
            onClick={clearFilters}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2C8.134 2 5 5.134 5 9c0 3.866 3.134 7 7 7s7-3.134 7-7c0-3.866-3.134-7-7-7zM9 12h.01M15 12h.01M12 14.5c-1.657 0-3 1.343-3 3v.5h6v-.5c0-1.657-1.343-3-3-3z"
              />
            </svg>
            Clear Filters
          </button>
        </div>

        <style jsx>{`
  .horror-button {
    font-family: 'Creepster', cursive; /* Use a horror-themed font */
    box-shadow: 0 0 10px 2px rgba(255, 0, 0, 0.7);
    position: relative;
    overflow: hidden;
  }

  .horror-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(120deg, transparent, rgba(255, 0, 0, 0.5), transparent);
    transition: all 0.5s;
  }

  .horror-button:hover::before {
    left: 100%;
  }

  .horror-button:hover {
    box-shadow: 0 0 15px 5px rgba(255, 0, 0, 1);
  }
`}</style>
      </div>
    </div>
  );
};

const RadioText = ({ text, id, status, type, functionOnClick }) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${status ? "text-red-500" : "text-gray-700"
        } hover:text-red-500 transition-colors`}
      onClick={() => functionOnClick(id, type)}
    >
      {status ? (
        <IoMdRadioButtonOn className="mr-2 text-lg" />
      ) : (
        <IoMdRadioButtonOff className="mr-2 text-lg" />
      )}
      <span className="text-sm">{text}</span>
    </label>
  );
};

export default LeftSection;