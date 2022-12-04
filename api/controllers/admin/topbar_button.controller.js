const TopBarButton = require("../../../models/topbar_button.model");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");
const { isMongooseId } = require("../../middleware/checkId.middleware");

// Index of Topbar button
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);

    const totalItems = await TopBarButton.countDocuments().exec();
    const results = await TopBarButton.find({}, { created_by: 0 })
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

const Update = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { ...updateObj } = req.body;
    await isMongooseId(id);

    const is_available = await TopBarButton.findById(id);
    if (!is_available) {
      return res.status(404).json({
        status: false,
        message: "Top bar button is not available",
      });
    }

    await TopBarButton.findByIdAndUpdate(id, {
      $set: updateObj,
    }).exec();

    res.status(201).json({
      status: true,
      message: "Top bar button updated",
    });
  } catch (error) {
    if (error) {
      next(error);
    }
  }
};

module.exports = {
  Index,
  Update,
};
