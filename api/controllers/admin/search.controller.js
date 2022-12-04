const Admin = require("../../../models/admin.model");
const User = require("../../../fabignecommerce/models/user/user");
const { HostURL } = require("../../helpers");

// Search admin
const AdminSearch = async (req, res, next) => {
  try {
    const items = [];
    const { query } = req.query;
    if (!query) {
      return res.status(422).json({
        status: false,
        query: "Query is required.",
      });
    }

    const queryValue = new RegExp(query, "i");
    const results = await Admin.find(
      {
        $and: [
          { _id: { $ne: req.user.id } },
          {
            $or: [
              { name: queryValue },
              { email: queryValue },
              { phone: queryValue },
            ],
          },
        ],
      },
      { name: 1, phone: 1, role: 1, status: 1, isOnline: 1, image: 1 }
    ).exec();

    if (results && results.length) {
      for (let i = 0; i < results.length; i++) {
        const element = results[i];

        if (element.role) {
          items.push({
            _id: element._id,
            name: element.name,
            phone: element.phone,
            role: element.role,
            status: element.status,
            isOnline: element.isOnline,
            image: HostURL(req) + "uploads/admin/" + element.image,
          });
        }
      }
    }

    res.status(200).json({
      status: true,
      data: items,
    });
  } catch (error) {
    if (error) next(error);
  }
};

// Search user
const UserSearch = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(422).json({
        status: false,
        query: "Query is required.",
      });
    }

    const queryValue = new RegExp(query, "i");
    const results = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: queryValue },
            { email: queryValue },
            { phone: queryValue },
          ],
        },
      ],
    }).exec();

    if (results && results.length) {
      results.map((item, index) => {
        if (item.image.length > 0) {
          results[index].image = "https://api.efgtailor.com" + item.image;
        }
      });
    }

    res.status(200).json({
      status: true,
      data: results,
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  AdminSearch,
  UserSearch,
};
