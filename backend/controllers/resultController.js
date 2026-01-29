import Result from "../models/resultModel.js";

//  create result
export async function createResult(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    const { title, technology, level, totalQuestions, correct, wrong } =
      req.body;
    if (
      !title ||
      !technology ||
      !level ||
      totalQuestions === null ||
      correct === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    //compute wrong if not provided
    // const computedWrong =
    //   wrong !== undefined
    //     ? Number(wrong)
    //     : Math.max(0, Number(totalQuestions) - Number(correct));

    // if (!title) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Missing title",
    //   });
    // }

    const tq = Number(totalQuestions);
    const corr = Number(correct);

    if (Number.isNaN(tq) || Number.isNaN(corr)) {
      return res.status(400).json({
        success: false,
        message: "Invalid numeric values",
      });
    }

    const techMap = {
      javascript: "js",
      js: "js",
      reactjs: "react",
      nodejs: "node",
    };

    const normalizedTechnology =
      techMap[String(technology).toLowerCase()] ||
      String(technology).toLowerCase();

    const payload = {
      title: String(title).trim(),
      // technology: technology.toLowerCase(),
      // technology: String(technology).toLowerCase(),
      // level,

      technology: normalizedTechnology,
      level: String(level).toLowerCase(),
      // totalQuestions: Number(totalQuestions),
      // correct: Number(correct),

      totalQuestions: tq,
      correct: corr,

      // wrong: computedWrong,
      wrong: Number(wrong) || Math.max(0, tq - corr),
      user: req.user._id, // for a perticular user
    };

    const created = await Result.create(payload);

    return res.status(201).json({
      success: true,
      message: "Result Created",
      results: created,
    });
  } catch (err) {
    console.error("CreateResult Error", err);
    return res.status(500).json({
      success: false,
      // message: "Server Error",
      message: err.message,
    });
  }
}

//LIST THE RESULT

export async function listResults(req, res) {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }
    const { technology } = req.query;
    const query = { user: req.user._id };

    if (technology && technology.toLowerCase() !== "all") {
      query.technology = technology.toLowerCase();
    }

    const items = await Result.find(query).sort({ createdAt: -1 }).lean();
    // const items = await Result.find({ user: req.user.id })
    //   .sort({ createdAt: -1 })
    //   .lean();

    return res.json({
      success: true,
      results: items,
    });
  } catch (err) {
    console.error("ListResults Error", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
