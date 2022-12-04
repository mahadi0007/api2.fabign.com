// List of items
const Index = async (req, res, next) => {
  try {
    res.status(200).json({
      status: true,
    });
  } catch (error) {
    if (error) next(error);
  }
};

module.exports = {
  Index,
};
