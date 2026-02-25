const codes = new Map();

function setCode(userId, code) {
  codes.set(userId, code);
}

function getCode(userId) {
  return codes.get(userId);
}

function removeCode(userId) {
  codes.delete(userId);
}

module.exports = { setCode, getCode, removeCode };