export function timeAgo(date: Date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)} seconds ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast <= 2592000) {
    return `${Math.floor(secondsPast / 86400)} days ago`;
  }
  if (secondsPast <= 31104000) {
    return `${Math.floor(secondsPast / 2592000)} months ago`;
  }
  return `${Math.floor(secondsPast / 31104000)} years ago`;
}

export function calculateDiscountPercentage(
  basePrice: number,
  discountedPrice: number
) {
  if (basePrice <= 0) {
    throw new Error("Base price must be greater than zero");
  }

  const discountAmount = basePrice - discountedPrice;
  const discountPercentage = (discountAmount / basePrice) * 100;

  return discountPercentage.toFixed(2); // Returns the percentage rounded to 2 decimal places
}

// timeUtils.js
