export const calculateFinalPrice = (product, variantId = null) => {
  let basePrice = product?.price;
  let price = basePrice;
  let discountInfo = "";

  // If a variant is selected, use its price
  if (variantId) {
    const variant = product?.variants.find((v) => v.id === variantId);
    if (variant) {
      basePrice = variant.price;
      price = variant.price;
    }
  }

  // Apply discount if active
  if (product?.discount) {
    price -= price * (product.discount / 100);
    discountInfo = `${product.discount}% off`;
  }

  // Apply offer if active
  // Apply offer if active
  if (product?.offer && product?.offer?.active) {
    if (product.offer.discount_type === "percentage") {
      price -= price * (product.offer.discount_value / 100);
      discountInfo = `${product.offer.discount_value}% off`;
    } else if (product.offer.discount_type === "fixed") {
      price -= product.offer.discount_value;
      discountInfo = `${product.offer.discount_value} off`;
    }
  }

  return {
    basePrice,
    price,
    discountInfo,
  };
};

// timeUtils.js
export const calculateTimeLeft = (endDate) => {
  const difference = new Date(endDate) - new Date();
  let timeLeft = {};

  const addLeadingZero = (num) => (num < 10 ? `0${num}` : num);

  if (difference > 0) {
    timeLeft = {
      days: addLeadingZero(Math.floor(difference / (1000 * 60 * 60 * 24))),
      hours: addLeadingZero(Math.floor((difference / (1000 * 60 * 60)) % 24)),
      minutes: addLeadingZero(Math.floor((difference / 1000 / 60) % 60)),
      seconds: addLeadingZero(Math.floor((difference / 1000) % 60)),
    };
  } else {
    timeLeft = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };
  }
  return timeLeft;
};
