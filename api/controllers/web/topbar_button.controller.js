const TopBarButton = require("../../../models/topbar_button.model");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");

// Index of Topbar Button
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);

    const totalItems = await TopBarButton.countDocuments().exec();
    const results = await TopBarButton.find()
      .sort({ _id: -1 })
      .skip(parseInt(page) * parseInt(limit) - parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    res.status(200).json({
      status: true,
      data: results,
      pagination: Paginate({ page, limit, totalItems }),
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
};
