import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pageNavigation: "",
  showSidebar: false,
  user: {},
  cartProducts: [],
  cartLocalStorage: [],
  catagories: [],

  cartLength: 0,
  cartTotal: 0,
  cartDiscount: 0,
};
// let localStoreItem = localStorage.getItem("cartItems")
//   ? JSON.parse(localStorage.getItem("cartItems"))
//   : [];

// localStoreItem.push(action.payload);
// localStorage.setItem("cartItems", JSON.stringify(localStoreItem));
export const featuresSlice = createSlice({
  name: "features",
  initialState,
  reducers: {
    updatePageNavigation: (state, action) => {
      state.pageNavigation = action.payload;
    },
    updateCategories: (state, action) => {
      state.catagories = action.payload;
    },
    updateSidebar: (state, action) => {
      state.showSidebar = action.payload;
    },
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    // updateCart: (state, action) => {
    //   state.cartProducts = [
    //     ...state.cartProducts,
    //     ...state.cartLocalStorage,
    //     action.payload,
    //   ];
    //   state.cartLength = state.cartProducts?.length;
    //   state.cartLocalStorage.push(action.payload);

    //   localStorage.setItem("cartItems", JSON.stringify(state.cartLocalStorage));

    //   const totalBill = state.cartProducts.reduce((acc, item) => {
    //     return acc + item.price * item.qty;
    //   }, 0);
    //   state.cartTotal = totalBill;
    // },
    updateCart: (state, action) => {
      const { type, product } = action.payload;

      if (type === "onRefresh") {
        state.cartProducts = state.cartLocalStorage;
      } else {
        const existingProductIndex = state.cartProducts.findIndex(
          (item) => item.id === product.id
        );

        if (existingProductIndex >= 0) {
          // If product exists, update the quantity
          state.cartProducts = state.cartProducts.map((item, index) => {
            if (index === existingProductIndex) {
              return {
                ...item,
                qty: item.qty + 1,
              };
            }

            return item;
          });
        } else {
          // If product does not exist, add the new product with quantity 1
          state.cartProducts = [...state.cartProducts, { ...product, qty: 1 }];
        }

        // Update the local storage cart
        if (typeof window !== "undefined") {
          localStorage.setItem("cartItems", JSON.stringify(state.cartProducts));
        }
      }
      // Update cart length
      state.cartLength = state.cartProducts?.length;

      // Calculate the total bill
      const totalBill = state.cartProducts.reduce((acc, item) => {
        // const price = item.discount ? item.discounted_price : item.price;
        return acc + item.discountPrice * item.qty;
      }, 0);
      const totalAmount = state.cartProducts.reduce((acc, item) => {
        // const price = item.discount ? item.discounted_price : item.price;
        return acc + item.originalPrice * item.qty;
      }, 0);
      state.cartTotal = totalBill;
      state.cartDiscount = totalAmount - totalBill;
    },
    onVariantChange: (state, action) => {
      const { product } = action.payload;
      const existingProductIndex = state.cartProducts.findIndex(
        (item) => item.id === product.id
      );
      if (existingProductIndex >= 0) {
        // If product exists, update the quantity
        state.cartProducts = state.cartProducts.map((item, index) => {
          if (index === existingProductIndex) {
            return {
              ...item,
              discountPrice: product.discountPrice,
              originalPrice: product.originalPrice,
              discountInfo: product.discountInfo,
            };
          }
          return item;
        });
        const totalBill = state.cartProducts.reduce((acc, item) => {
          // const price = item.discount ? item.discounted_price : item.price;
          return acc + item.discountPrice * item.qty;
        }, 0);
        const totalAmount = state.cartProducts.reduce((acc, item) => {
          // const price = item.discount ? item.discounted_price : item.price;
          return acc + item.originalPrice * item.qty;
        }, 0);
        state.cartTotal = totalBill;
        state.cartDiscount = totalAmount - totalBill;
      }
    },

    updateCartInitialState: (state, action) => {
      state.cartLocalStorage = action.payload;
    },

    updateProductQty: (state, action) => {
      const cartProducts = state.cartProducts;
      const { type, id, qty } = action.payload;
      if (type === "decrement" && qty > 1) {
        cartProducts.map((item) => (item.id === id ? (item.qty -= 1) : item));
      } else if (type === "increment") {
        cartProducts.map((item) => (item.id === id ? (item.qty += 1) : item));
      } else return;
      const totalBill = state.cartProducts.reduce((acc, item) => {
        // const price = item.discount ? item.discounted_price : item.price;
        return acc + item.discountPrice * item.qty;
      }, 0);

      const totalAmount = state.cartProducts.reduce((acc, item) => {
        // const price = item.discount ? item.discounted_price : item.price;
        return acc + item.originalPrice * item.qty;
      }, 0);
      state.cartTotal = totalBill;
      state.cartDiscount = totalAmount - totalBill;

      const cartLocalStorage = state.cartLocalStorage;
      cartLocalStorage.map((item) =>
        item.id === id ? (item.qty = qty) : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("cartItems", JSON.stringify(cartLocalStorage));
      }
    },
    clearCart: (state) => {
      state.cartProducts = [];
      state.cartLocalStorage = [];
      state.cartLength = 0;
      state.cartTotal = 0;
      state.cartDiscount = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("cartItems");
      }
    },
    deleteCartProduct: (state, action) => {
      let cartProducts = state.cartProducts;
      const id = action.payload;
      const filterProduct = cartProducts.filter((item) => item.id !== id);
      state.cartProducts = filterProduct;
      state.cartLength = state.cartProducts?.length;
      const totalBill = state.cartProducts.reduce((acc, item) => {
        const price = item.discount ? item.discounted_price : item.price;
        return acc + price * item.qty;
      }, 0);
      state.cartTotal = totalBill;

      const filterProductLocalStorage = state.cartLocalStorage.filter(
        (item) => item.id !== id
      );

      state.cartLocalStorage = filterProductLocalStorage;
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "cartItems",
          JSON.stringify(filterProductLocalStorage)
        );
      }
    },
  },
});

export const {
  updatePageNavigation,
  updateSidebar,
  updateUser,
  updateCart,
  updateProductQty,
  deleteCartProduct,
  updateCartInitialState,
  onVariantChange,
  updateCategories,
  clearCart
} = featuresSlice.actions;
export const featuresReducer = featuresSlice.reducer;
