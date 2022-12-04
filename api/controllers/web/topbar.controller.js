const TopBar = require("../../../models/topbar.model");
const {
  Paginate,
  PaginateQueryParams,
} = require("../../helpers/paginate.helpers");
const { HostURL } = require("../../helpers");

// Index of Topbar
const Index = async (req, res, next) => {
  try {
    const { limit, page } = PaginateQueryParams(req.query);

    const totalItems = await TopBar.countDocuments().exec();
    const results = await TopBar.find({ is_default: true }, { created_by: 0 })
      .sort({ _id: -1 })
      .skip(parseInt(page) * parseInt(limit) - parseInt(limit))
      .limit(parseInt(limit))
      .exec();

    const items = [];

    if (results && results.length) {
      for (let i = 0; i < results.length; i++) {
        const element = results[i];

        if (element) {
          items.push({
            _id: element._id,
            title: element.title,
            link: element.link,
            is_default: element.is_default,
            is_hidden: element.is_hidden,
            icon: HostURL(req) + "uploads/topbar/icons/" + element.icon,
          });
        }
      }
    }

    res.status(200).json({
      status: true,
      data: items,
      pagination: Paginate({ page, limit, totalItems }),
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
};
