function sendSuccess(res, data, message, options = {}) {
  const base = { success: true, message };
 
  if (
    options.flatten &&
    data &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    console.log(" in condtion final response ",{ ...base, data })
    return res.json({ ...data, ...base, data });
  }
 console.log(" final response ",{ ...base, data })
  return res.json({ ...base, data });
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { sendSuccess, sendError };
