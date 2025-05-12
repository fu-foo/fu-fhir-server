/**
 * @file IGによる多重度チェック
 */
const _ = require('lodash');

/**
 * 多重度チェック
 *
 * @param {Object} resource - FHIRリソース
 * @param {Object} structureDefinition - structureDefinition
 * @returns {string[]} 多重度エラーの内容を返す
 */
function validateCardinality(resource, structureDefinition) {
  const errors = [];
  const elements = structureDefinition.snapshot?.element || [];

  for (const element of elements) {
    const path = element.path;
    const min = element.min ?? 0;
    const max = element.max === '*' ? Infinity : parseInt(element.max);

    // Convert absolute path like "Patient.name" to relative path "name"
    const relativePath = path.replace(/^.+?\./, '');

    // Get value from the resource using lodash.get
    const value = _.get(resource, relativePath);

    let actualCount = 0;
    if (value === undefined || value === null) {
      actualCount = 0;
    } else if (Array.isArray(value)) {
      actualCount = value.length;
    } else {
      actualCount = 1;
    }

    if (actualCount < min) {
      errors.push(`[${path}] がない (最小: ${min})`);
    } else if (actualCount > max) {
      errors.push(`[${path}] が想定以上にある (最大: ${max}, 実際: ${actualCount})`);
    }
  }

  return errors;
}

module.exports = { validateCardinality };
