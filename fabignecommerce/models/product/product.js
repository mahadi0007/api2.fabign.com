const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  productId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  banglaName: {
    type: String,
  },
  sku: {
    type: String,
    trim: true,
    default: "",
  },
  barcodeType: {
    type: String,
    default: "",
    trim: true,
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: "Brand",
    default: null,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "ItemCategory",
  },
  subcategory: {
    type: Schema.Types.ObjectId,
    ref: "ItemSubCategory",
    default: null,
  },
  business_locations: [
    {
      type: String,
      default: "",
      trim: true,
    },
  ],
  manageStock: {
    type: Boolean,
    default: false,
  },
  alertQuantity: {
    type: Number,
  },
  description: {
    type: String,
    default: "",
  },
  shortDescription: {
    type: String,
    default: "",
  },
  margin: {
    type: Number,
    default: 0,
  },
  sellingPrice: {
    type: Number,
    default: 0,
  },
  featuredImage: {
    small: {
      type: String,
      trim: true,
      required: true,
    },
    large: {
      type: String,
      trim: true,
      required: true,
    },
  },
  galleryImages: [
    {
      small: {
        type: String,
        trim: true,
        required: true,
      },
      large: {
        type: String,
        trim: true,
        required: true,
      },
    },
  ],
  weight: {
    type: Number,
    default: null,
  },
  length: {
    type: Number,
    default: null,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
  },
  customFields: [
    {
      label: {
        type: String,
        trim: true,
      },
      value: {
        type: String,
        trim: true,
      },
    },
  ],
  regularPrice: {
    type: Number,
    default: 0,
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  productType: {
    type: String,
    default: "",
  },
  faq: {
    type: Boolean,
    default: false,
  },
  additionalInfo: {
    type: Boolean,
    default: false,
  },
  variation: {
    parents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Variation",
      },
    ],
    values: [
      {
        sku: {
          type: String,
          trim: true,
        },
        value: {
          type: String,
          trim: true,
          required: true,
        },
        margin: {
          type: Number,
          trim: true,
        },
        sellingPrice: {
          type: Number,
          default: 0,
        },
        regularPrice: {
          type: Number,
          default: 0,
        },
        costPrice: {
          type: Number,
          default: 0,
        },
        images: [
          {
            type: String,
            trim: true,
          },
        ],
        manageStock: {
          type: Boolean,
          default: true,
        },
        alertAmount: {
          type: Number,
          default: 0,
        },
        stockAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  published: {
    type: Boolean,
    default: true,
  },
  stockAmount: {
    type: Number,
    default: 0,
  },
  ratingReview: [
    {
      type: Schema.Types.ObjectId,
      ref: "RatingReview",
      default: [],
    },
  ],
  avgRating: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3, 4, 5],
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  stockHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "StockHistory",
      default: [],
    },
  ],
});

module.exports = model("Product", productSchema, "products");
